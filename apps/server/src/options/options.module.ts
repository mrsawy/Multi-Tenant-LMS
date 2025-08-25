import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';
import { Option, OptionSchema } from './entities/option.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Option.name, schema: OptionSchema },
    ]),
  ],
  controllers: [OptionsController],
  providers: [OptionsService],
  exports: [OptionsService], // Optional: export if used in other modules
})
export class OptionsModule {}
