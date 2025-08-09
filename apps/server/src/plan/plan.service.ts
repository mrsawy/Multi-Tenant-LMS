import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Plan } from './entities/plan.entity';
import { Model } from 'mongoose';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>
  ) { }
  async create(createPlanDto: CreatePlanDto) {

    const createdPlan = await this.planModel.create(createPlanDto);

    return createdPlan
  }

  findAll() {
    return `This action returns all plan`;
  }

  async findOne(id: string) {
    try {
      const foundedPlan = await this.planModel.findById(id);
      return foundedPlan;
    } catch (error) {
      console.error(error)
      throw new NotFoundException(error)
    }

  }

  update(id: number, updatePlanDto: UpdatePlanDto) {
    return `This action updates a #${id} plan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
