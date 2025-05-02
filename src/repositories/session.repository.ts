import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { channel } from 'diagnostics_channel';
import { Session } from '../models/session.model';
@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(
    userId: number,
    access_token: string,
    access_expires_at: Date,
    refresh_token: string,
    refresh_expires_at: Date,
    revoked: boolean,
    issued_at: Date,
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      user: { id: userId },
      access_token,
      access_expires_at,
      refresh_token,
      refresh_expires_at,
      revoked,
      issued_at,
    });
    return this.sessionRepository.save(session);
  }

  async updateAccessToken(
    sessionId: number,
    newAccessToken: string,
    newAccessExpiresAt: Date,
  ): Promise<Session> {
    const session = await this.sessionRepository.findOneBy({ session_id: sessionId });
    if (!session) {
      throw new Error('Session not found');
    }
    session.access_token = newAccessToken;
    session.access_expires_at = newAccessExpiresAt;
    return this.sessionRepository.save(session);
  }

  async updateRefreshToken(
    sessionId: number,
    newRefreshToken: string,
    newRefreshExpiresAt: Date,
  ): Promise<Session> {
    const session = await this.sessionRepository.findOneBy({ session_id: sessionId });
    if (!session) {
      throw new Error('Session not found');
    }
    session.refresh_token = newRefreshToken;
    session.refresh_expires_at = newRefreshExpiresAt;
    return this.sessionRepository.save(session);
  }

  async revokeSession(sessionId: number): Promise<Session> {
    const session = await this.sessionRepository.findOneBy({ session_id: sessionId });
    if (!session) {
      throw new Error('Session not found');
    }
    session.revoked = true;
    return this.sessionRepository.save(session);
  }
}

