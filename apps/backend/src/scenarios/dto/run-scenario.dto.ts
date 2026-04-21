import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { scenarioTypes } from '../scenario.constants';

export class RunScenarioDto {
  @IsIn(scenarioTypes)
  type!: (typeof scenarioTypes)[number];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
