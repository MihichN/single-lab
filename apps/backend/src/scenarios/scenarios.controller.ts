import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RunScenarioDto } from './dto/run-scenario.dto';
import { ScenariosService } from './scenarios.service';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Get()
  @ApiOperation({ summary: 'List the latest scenario runs' })
  async listScenarioRuns() {
    return this.scenariosService.listLatestRuns();
  }

  @Post('run')
  @ApiOperation({ summary: 'Run a Signal Lab scenario' })
  async runScenario(@Body() input: RunScenarioDto) {
    return this.scenariosService.runScenario(input);
  }
}
