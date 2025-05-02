import { Controller, Get, Post, Put, Delete, Body, Param, Headers, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateTaskDto } from 'src/dto/task/create-task.dto';
import { TaskManagerService } from 'src/services/task.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/middlewares/public-flag';

@ApiTags('Tasks')
@Controller('tasks-manager')
export class TaskController {
  constructor(private readonly taskManagerService: TaskManagerService) {}
  // ------------------------------------------------------------------------------
  // Create a new task
  // ------------------------------------------------------------------------------
  @ApiBearerAuth('access-token')
  @Post('create')
  @ApiOperation({ summary: 'Create a new task' })
  async createTask(@Headers('username') username: string, @Body() createTaskDto: CreateTaskDto) {
    return await this.taskManagerService.createTask(username, createTaskDto);
  }
  // ------------------------------------------------------------------------------
  // Get all tasks
  // ------------------------------------------------------------------------------
  @Get('Alltasks/:username')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getAllTasks(@Param('username') username: string) {
      
      const result = await this.taskManagerService.getAllTasks(username);
      return result;
  
  }
  // ------------------------------------------------------------------------------
  // Delete a task by ID
  // ------------------------------------------------------------------------------
  @Delete('delete/:id')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiResponse({ status: 200, description: 'Success' })
  async deleteTask(@Param('id') id: string) {
     const result = await this.taskManagerService.deleteTask(id);
     return result;
  }
  // ------------------------------------------------------------------------------
  // Update a task by ID
  // ------------------------------------------------------------------------------
  @Put('update/:id')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({ status: 200, description: 'Success' })
  async updateTask(@Param('id') id: string, @Body() updateTaskDto: any) {
    const result = await this.taskManagerService.updateTask(id, updateTaskDto);
    return result;
  }
  // ------------------------------------------------------------------------------
  // Get a task by ID
  // ------------------------------------------------------------------------------
  @Get('getById/:id')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getTaskById(@Param('id') id: string) {
    const result = await this.taskManagerService.getTaskById(id);
    return result;
  }
  // ------------------------------------------------------------------------------
  // Get type task
  // ------------------------------------------------------------------------------
  @Get('getTypeTask')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get type of task' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getTypeTask() {
    const result = await this.taskManagerService.getTypeTask();
   return result;
  
  }
  // ------------------------------------------------------------------------------
  // Get status task
  // ------------------------------------------------------------------------------
  @Get('getStatusTask')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get status of task' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getStatusTask() {
  const result = await this.taskManagerService.getStatusTask();
  return result;
  
  }
  // ------------------------------------------------------------------------------
  // Get priority task
  // ------------------------------------------------------------------------------
  @Get('getPriorityTask')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get priority of task' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getPriorityTask() {
  const result = await this.taskManagerService.getPriorityTask();
  return result;
  
  }
  //  ------------------------------------------------------------------------------
  //  get label task
  //  ------------------------------------------------------------------------------
  @Get('getLabelTask')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get label of task' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getLabelTask() {
      const result = await this.taskManagerService.getLabelTask();
      return result;
      
  }
}