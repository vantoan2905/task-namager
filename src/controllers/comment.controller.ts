import { 
  Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, HttpCode 
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment.model';
import { CreateCommentDto } from 'src/dto/comment/create-comment.dto';
import { UpdateCommentDto } from 'src/dto/comment/update-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new comment' })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { taskId, username , messege } = createCommentDto;
    
    return this.commentService.createComment(taskId, username, messege);
  }

  @Get('task/:taskId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all comments for a specific task' })
  async getCommentsByTask(
    @Param('taskId') taskId: number,
  ) {
    return this.commentService.getCommentsByTask(taskId);
  }

  @Put(':commentId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a comment' })
  async updateComment(
    @Body() updateDto: UpdateCommentDto,
  ) {
    const { commentid, username, messege, taskId} = updateDto
    return this.commentService.updateComment(commentid, username, messege, taskId);
  }

  @Delete(':commentId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a comment' })

  async deleteComment(
    @Param('commentId') commentId: number,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.commentService.deleteComment(commentId);
  }
}
