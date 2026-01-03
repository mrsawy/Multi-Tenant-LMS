import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, PaginateModel } from 'mongoose';
import { Discussion } from './entities/discussion.entity';
import { CourseDiscussion } from './entities/course-discussion.entity';
import { ModuleDiscussion } from './entities/module-discussion.entity';
import { ContentDiscussion } from './entities/content-discussion.entity';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { GetDiscussionsDto } from './dto/get-discussions.dto';
import DiscussionType from './enum/discussion-type.enum';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectModel(Discussion.name)
    private discussionModel: Model<Discussion> & PaginateModel<Discussion>,
    @InjectModel(CourseDiscussion.name)
    private courseDiscussionModel: Model<CourseDiscussion> & PaginateModel<CourseDiscussion>,
    @InjectModel(ModuleDiscussion.name)
    private moduleDiscussionModel: Model<ModuleDiscussion> & PaginateModel<ModuleDiscussion>,
    @InjectModel(ContentDiscussion.name)
    private contentDiscussionModel: Model<ContentDiscussion> & PaginateModel<ContentDiscussion>
  ) {}

  async create(createDiscussionDto: CreateDiscussionDto, userId: string): Promise<Discussion> {
    const { type, parentId, ...rest } = createDiscussionDto;

    // If parentId is provided, verify it exists
    if (parentId) {
      const parentDiscussion = await this.discussionModel.findById(parentId);
      if (!parentDiscussion) {
        throw new NotFoundException('Parent discussion not found');
      }
    }

    let discussion: Discussion;

    switch (type) {
      case DiscussionType.COURSE:
        if (!createDiscussionDto.courseId) {
          throw new BadRequestException('courseId is required for course discussion');
        }
        discussion = await this.courseDiscussionModel.create({
          userId: new Types.ObjectId(userId),
          content: rest.content,
          courseId: new Types.ObjectId(createDiscussionDto.courseId),
          parentId: parentId ? new Types.ObjectId(parentId) : null,
        });
        break;

      case DiscussionType.MODULE:
        if (!createDiscussionDto.courseId || !createDiscussionDto.moduleId) {
          throw new BadRequestException('courseId and moduleId are required for module discussion');
        }
        discussion = await this.moduleDiscussionModel.create({
          userId: new Types.ObjectId(userId),
          content: rest.content,
          courseId: new Types.ObjectId(createDiscussionDto.courseId),
          moduleId: new Types.ObjectId(createDiscussionDto.moduleId),
          parentId: parentId ? new Types.ObjectId(parentId) : null,
        });
        break;

      case DiscussionType.CONTENT:
        if (!createDiscussionDto.courseId || !createDiscussionDto.moduleId || !createDiscussionDto.contentId) {
          throw new BadRequestException('courseId, moduleId, and contentId are required for content discussion');
        }
        discussion = await this.contentDiscussionModel.create({
          userId: new Types.ObjectId(userId),
          content: rest.content,
          courseId: new Types.ObjectId(createDiscussionDto.courseId),
          moduleId: new Types.ObjectId(createDiscussionDto.moduleId),
          contentId: new Types.ObjectId(createDiscussionDto.contentId),
          parentId: parentId ? new Types.ObjectId(parentId) : null,
        });
        break;

      default:
        throw new BadRequestException('Invalid discussion type');
    }

    // Update parent repliesCount
    if (parentId) {
      await this.discussionModel.findByIdAndUpdate(parentId, {
        $inc: { repliesCount: 1 },
      });
    }

    return discussion;
  }

  async findAll(getDiscussionsDto: GetDiscussionsDto) {
    const { type, entityId, moduleId, contentId, parentId = null, page = 1, limit = 20 } = getDiscussionsDto;

    const matchCondition: FilterQuery<Discussion> = {
      type,
      isDeleted: false,
      parentId,
    };

    // Build match condition based on type
    switch (type) {
      case DiscussionType.COURSE:
        (matchCondition as any).courseId = new Types.ObjectId(entityId);
        break;
      case DiscussionType.MODULE:
        (matchCondition as any).courseId = new Types.ObjectId(entityId);
        (matchCondition as any).moduleId = new Types.ObjectId(moduleId);
        break;
      case DiscussionType.CONTENT:
        (matchCondition as any).courseId = new Types.ObjectId(entityId);
        (matchCondition as any).moduleId = new Types.ObjectId(moduleId);
        (matchCondition as any).contentId = new Types.ObjectId(contentId);
        break;
    }
    const discussions = await this.discussionModel.paginate(matchCondition, {
      page,
      limit,
      populate: 'user',
    });

    return discussions;
  }

  async findOne(id: string): Promise<Discussion> {
    const discussion = await this.discussionModel.findById(id).populate('userId', '-password -refreshToken').exec();

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    return discussion;
  }

  async update(id: string, updateDiscussionDto: UpdateDiscussionDto, userId: string): Promise<Discussion> {
    const discussion = await this.discussionModel.findById(id);

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    if (discussion.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own discussions');
    }

    discussion.content = updateDiscussionDto.content;
    discussion.isEdited = true;

    await discussion.save();

    return discussion;
  }

  async remove(id: string, userId: string): Promise<void> {
    const discussion = await this.discussionModel.findById(id);

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    if (discussion.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own discussions');
    }

    // Soft delete
    discussion.isDeleted = true;
    await discussion.save();

    // Update parent repliesCount if exists
    if (discussion.parentId) {
      await this.discussionModel.findByIdAndUpdate(discussion.parentId, {
        $inc: { repliesCount: -1 },
      });
    }
  }

  async toggleLike(id: string, userId: string): Promise<Discussion> {
    const discussion = await this.discussionModel.findById(id);

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = discussion.likedBy.some((id) => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      discussion.likedBy = discussion.likedBy.filter((id) => id.toString() !== userId);
      discussion.likesCount = Math.max(0, discussion.likesCount - 1);
    } else {
      // Like
      discussion.likedBy.push(userObjectId as any);
      discussion.likesCount += 1;
    }

    await discussion.save();

    return discussion;
  }

  async getUserDiscussions(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;

    const result = await this.discussionModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                'user.password': 0,
                'user.refreshToken': 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ['$metadata.total', 0] },
          page: { $literal: page },
          limit: { $literal: limit },
        },
      },
    ]);

    return result[0] || { data: [], total: 0, page, limit };
  }
}
