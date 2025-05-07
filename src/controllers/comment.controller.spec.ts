import { CommentController } from '../controllers/comment.controller';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from 'src/dto/comment/create-comment.dto';
import { UpdateCommentDto } from 'src/dto/comment/update-comment.dto';
import * as fs from 'fs';

declare const jest: any;

// Ensure outputs directory exists
type OutputData = { api: string; input: any; result?: any; status: string };
const outputsDir = './__tests__/auth-test-results';
const aggregateFile = `${outputsDir}/aggregate_results.json`;
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}

// Initialize aggregate array
let aggregateResults: OutputData[] = [];

// Helper to collect output
function collectOutput(data: OutputData) {
  aggregateResults.push(data);
}

// After all tests, write aggregate file
afterAll(() => {
  fs.writeFileSync(aggregateFile, JSON.stringify(aggregateResults, null, 2));
});

// Create a mock CommentService
const mockCommentService = () => ({
  createComment: jest.fn(),
  getCommentsByTask: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
});

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: ReturnType<typeof mockCommentService>;

  beforeEach(() => {
    commentService = mockCommentService();
    controller = new CommentController(commentService as unknown as CommentService);
    jest.clearAllMocks();
  });
  // -----------------------------------------------------------------------------
  // createComment
  // ----------------------------------------------------------------------------
  describe('createComment', () => {
    it('good value', async () => {
      const dto: CreateCommentDto = { taskId: 42, username: 'alice', messege: 'Hello' };
      const expected = { id: 1, ...dto };
      commentService.createComment.mockResolvedValue(expected);

      const result = await controller.createComment(dto);
      collectOutput({ api: 'createComment', input: dto, result, status: 'good' });

      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      const dto = { taskId: 10, username: 'bob' } as any;
      commentService.createComment.mockRejectedValue(new Error('Missing fields'));

      await expect(controller.createComment(dto)).rejects.toThrow();
      collectOutput({ api: 'createComment', input: dto, status: 'missing' });
    });

    it('bad value', async () => {
      const dto: CreateCommentDto = { taskId: -1, username: 'charlie', messege: 'Oops' };
      commentService.createComment.mockRejectedValue(new Error('Invalid taskId'));

      await expect(controller.createComment(dto)).rejects.toThrow();
      collectOutput({ api: 'createComment', input: dto, status: 'bad' });
    });
  });

  // -----------------------------------------------------------------------------
  // getCommentsByTask
  // ----------------------------------------------------------------------------

  describe('getCommentsByTask', () => {
    it('good value', async () => {
      const taskId = 7;
      const expected = [{ id: 1, taskId, username: 'bob', messege: 'Test' }];
      commentService.getCommentsByTask.mockResolvedValue(expected);

      const result = await controller.getCommentsByTask(taskId);
      collectOutput({ api: 'getCommentsByTask', input: { taskId }, result, status: 'good' });

      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      commentService.getCommentsByTask.mockRejectedValue(new Error('Missing taskId'));
      // @ts-ignore
      await expect(controller.getCommentsByTask(undefined)).rejects.toThrow();
      collectOutput({ api: 'getCommentsByTask', input: {}, status: 'missing' });
    });

    it('bad value', async () => {
      const taskId = -5;
      commentService.getCommentsByTask.mockRejectedValue(new Error('Invalid taskId'));

      await expect(controller.getCommentsByTask(taskId)).rejects.toThrow();
      collectOutput({ api: 'getCommentsByTask', input: { taskId }, status: 'bad' });
    });
  });

  describe('updateComment', () => {
    it('good value', async () => {
      const dto: UpdateCommentDto = { commentid: 5, username: 'charlie', messege: 'Updated', taskId: 3 };
      const expected = { affected: 1 };
      commentService.updateComment.mockResolvedValue(expected);

      const result = await controller.updateComment(dto);
      collectOutput({ api: 'updateComment', input: dto, result, status: 'good' });

      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      const dto = { username: 'dave', messege: 'Hi', taskId: 2 } as any;
      commentService.updateComment.mockRejectedValue(new Error('Missing commentid'));

      await expect(controller.updateComment(dto)).rejects.toThrow();
      collectOutput({ api: 'updateComment', input: dto, status: 'missing' });
    });

    it('bad value', async () => {
      const dto: UpdateCommentDto = { commentid: -2, username: 'eve', messege: 'Error', taskId: 1 };
      commentService.updateComment.mockRejectedValue(new Error('Invalid commentid'));

      await expect(controller.updateComment(dto)).rejects.toThrow();
      collectOutput({ api: 'updateComment', input: dto, status: 'bad' });
    });
  });

  describe('deleteComment', () => {
    it('good value', async () => {
      const commentId = 9;
      const req = { user: { sub: 10 } };
      const expected = { affected: 1 };
      commentService.deleteComment.mockResolvedValue(expected);

      const result = await controller.deleteComment(commentId, req as any);
      collectOutput({ api: 'deleteComment', input: { commentId }, result, status: 'good' });

      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      commentService.deleteComment.mockRejectedValue(new Error('Missing commentId'));
      // @ts-ignore
      await expect(controller.deleteComment(undefined, { user: { sub: 1 } })).rejects.toThrow();
      collectOutput({ api: 'deleteComment', input: {}, status: 'missing' });
    });

    it('bad value', async () => {
      const commentId = -10;
      const req = { user: { sub: 1 } };
      commentService.deleteComment.mockRejectedValue(new Error('Invalid commentId'));

      await expect(controller.deleteComment(commentId, req as any)).rejects.toThrow();
      collectOutput({ api: 'deleteComment', input: { commentId }, status: 'bad' });
    });
  });
});
