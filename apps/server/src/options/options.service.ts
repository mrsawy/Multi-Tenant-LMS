import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { Option } from './entities/option.entity';

@Injectable()
export class OptionsService {
  constructor(
    @InjectModel(Option.name) private readonly optionModel: Model<Option>,
  ) { }

  // Create a new option
  async create(createOptionDto: CreateOptionDto): Promise<Option> {
    const foundedOption = await this.optionModel.findOne({ key: createOptionDto.key });
    if (foundedOption) throw new BadRequestException('Option with this key already exists');
    const option = new this.optionModel(createOptionDto);
    return option.save();
  }

  // Get all options (you can filter by organizationId if multi-tenant)
  async findAll(): Promise<Option[]> {
    return this.optionModel.find().exec();
  }

  // Get single option by ID
  async findOne(identifier: string): Promise<Option> {
    let option: Option | null = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      option = await this.optionModel.findById(identifier).exec();
    }
    option = await this.optionModel.findOne({
      key: identifier
    }).exec();
    if (!option) {
      throw new NotFoundException(`Option with identifier "${identifier}" not found`);
    }
    return option;
  }

  // Update an existing option
  async update(id: string, updateOptionDto: UpdateOptionDto): Promise<Option> {
    const updatedOption = await this.optionModel
      .findByIdAndUpdate(id, updateOptionDto, { new: true })
      .exec();
    if (!updatedOption) {
      throw new NotFoundException(`Option with ID "${id}" not found`);
    }
    return updatedOption;
  }

  // Delete an option
  async remove(id: string): Promise<void> {
    const result = await this.optionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Option with ID "${id}" not found`);
    }
  }
}
