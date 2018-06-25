import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as dotenv from 'dotenv';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    dotenv.config();

    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should login', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'natete', password: '1234' })
      .expect(201)
      .expect(res => {
        accessToken = res.body.accessToken;
      });
  });

  it('/GET /', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', `bearer ${accessToken}`)
      .expect(200)
      .expect('Hello World!');
  });
});
