import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './../../entity/user.entity';
import { AppModule } from './../../src/app.module';
import { INestApplication } from '@nestjs/common';

type MakeOptional<T, K extends keyof T> =
    Omit<T, K> & { [P in K]?: T[P] };
type sanitizedUser =  MakeOptional<User, 'password'>;   

function generateUserFixtures(quantity) {
  const users = [];
  for (let number = 1; number !== quantity; number += 1) {
    users.push({
      name: `User${number}`,
      login: `login${number}`,
      password: `pass${number}`,
    });
  }
  return users;
}

describe('UserService', () => {
  let app: INestApplication;
  let userService: UserService;
  let createdUsers: sanitizedUser[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = app.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create user', () => {
    const fixtures = generateUserFixtures(10);
      it('created', async () => {
      await Promise.all(fixtures.map(async user => {
          const createdUser = await userService.createUser(user);
          expect(createdUser).toBeInstanceOf(User);
          createdUsers.push(createdUser);
        }))
      })
    it('throw error for unique login', async () => {
      await Promise.all(fixtures.map(async user => {
        //const createdUser = await userService.createUser(user);
        expect(async () => await userService.createUser(user)).rejects.toThrow(`User with login ${user.login} is already exists`);
      }))
    })
  })

  describe('get created users', () => {
    it("by ID", async () => {
      await Promise.all(createdUsers.map(async user => {
        const findedUser = await userService.getUser(user.id);
        expect(findedUser).toBeInstanceOf(User);
      }))
    })
    it("by Login", async () => {
      await Promise.all(createdUsers.map(async user => {
        const findedUser = await userService.findUserByLogin(user.login);
        expect(findedUser).toBeInstanceOf(User);
        expect(findedUser.login).toEqual(user.login)
      }))
    })
  })
  describe('delete users', () => {
    it('delete', async () => {
      await Promise.all(createdUsers.map(async user => {
      const deleteduser = await userService.deleteUser(user.id);
      expect(deleteduser).toBeInstanceOf(User);
      }))
    })
    it('check deleted in database', async () => {
      await Promise.all(createdUsers.map(async user => {
      const deleteduser = await userService.getUser(user.id);
      expect(deleteduser).toBe(null);
      //expect(async () => await userService.getUser(user.id)).rejects.toThrow();
      }))
    })
  })
});
