import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../models/comment.model';
import { Task } from 'src/models/task.model';
import { User } from 'src/models/user.model';
import { InternalServerErrorException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { response } from 'express';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    // Create a new comment
    async createComment(taskId: number, username: string, message: string): Promise< { id: number}> {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }
    
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException(`User with username ${username} not found`);
        }
    
        try {
            const comment = this.commentRepository.create({
                message,
                task,
                user,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const savedComment = await this.commentRepository.save(comment);
            
            return { id: savedComment.id };
        } catch (err) {
            console.error('Failed to create comment:', err);
            throw new InternalServerErrorException('Failed to create comment');
        }
    }
    

    // Get all comments for a specific task
    async getCommentsByTask(taskId: number): Promise<{ id: number, status: string, message: string, username: string, createdAt: Date, updatedAt: Date }[]> {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        const comment = await this.commentRepository.find({
            where: { task: { id: taskId } },
            relations: ['user', 'task'],
        });
        let response = comment.map((comment) => ({
            id: comment.id,
            status: comment.status,
            message: comment.message,
            username: comment.user.username,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        }))
        return response

    }

    // Update a comment
    async updateComment(commentId: number, username: string, message: string, taskId: number): Promise<{ id: number}> {
    const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['user', 'task'], // đảm bảo comment.user và comment.task được load
    });

    if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || user.id !== comment.user.id) {
        throw new UnauthorizedException(`User not authorized to update this comment`);
    }

    if (comment.task.id !== taskId) {
        throw new BadRequestException(`Comment does not belong to task with ID ${taskId}`);
    }

    comment.message = message;
    comment.updatedAt = new Date();
    try{
        await this.commentRepository.save(comment);}
    catch(err){
        console.error('Failed to update comment:', err);
        throw new InternalServerErrorException('Failed to update comment');
    }
    return { id: comment.id };
}


    // Delete a comment
    async deleteComment(commentId: number): Promise<void> {
        const comment = await this.commentRepository.findOne({ where: { id: commentId } });
        if (!comment) {
            throw new NotFoundException(`Comment with ID ${commentId} not found`);
        }

        await this.commentRepository.remove(comment);
    }
}