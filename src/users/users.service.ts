import { Injectable,ConflictException, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './user.entity';
//import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, compare } from 'bcrypt';
import { Roles } from '../roles/role.entity'; // Import the Role entity



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    
    @InjectRepository(Roles)
    private roleRepository: Repository<Roles>,
  
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
 const {username,email,password,personal_ID,role,imagePath } = createUserDto;
 

 const existingUser  = await this.userRepository.findOne({
  where: [{ username }, { email }, { personal_ID }],
});

if (existingUser ) {
  throw new ConflictException('User  already exists');
}

   // Check if the role exists
   const roleEntity = await this.roleRepository.findOne({ where: { id: role } }); // Use an object to find by ID
   if (!roleEntity) {
     throw new NotFoundException(`Role with ID "${role}" not found`);
   }


   // Hash the password
   const hashedPassword = await hash(password, 10);
    // Create the user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: roleEntity, // Assign the role object
      image: imagePath 
    });

    return this.userRepository.save(user);
  

  }

  async findAll(): Promise<Users[]> {
    const users = await this.userRepository.find({ relations: ['role'] }); // Cargar la relación 'role'
    console.log('Fetched users:', users); // Log the fetched users
    return users;
  }

  async findOne(user_id: number): Promise<Users | null> {
    const user = await this.userRepository.findOne({
      where: { user_id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User  with ID "${user_id}" not found`);
    }

    return user;
  }


  async findByUsername(username:string): Promise<Users | null> {
  const user = await this.userRepository.findOne({
    where: { username },
    relations: ['role'], // Cargar la relación 'role'
  })

  if(!user){
    throw new NotFoundException(`User with username ${username} not found`)
  }

  return user
}

async findByPersonalId(personal_ID:string): Promise<Users | null> {
  const user = await this.userRepository.findOne({
    where: { personal_ID },
    relations: ['role'],
    });

    if(!user){
      throw new NotFoundException(`User with personal ID ${personal_ID} not found`)
    }
    return user
    }


async update(user_id:number,updateUserDto: Partial<CreateUserDto>): Promise<Users>{
  const user = await this.userRepository.findOne({ where: { user_id } }); // Use an object with a where clause
  if(!user){
    throw new NotFoundException(`User with ID "${user_id}" not found`)
    }

    Object.assign(user,updateUserDto)

    if(updateUserDto.password){
      user.password = await hash(updateUserDto.password, 10)
    }
    return this.userRepository.save(user)
}

async createMultiple(createUsersDto: CreateUserDto[]): Promise<Users[]> {
  const usersToCreate: Users[] = [];

  for (const userDto of createUsersDto) {
    const { username, email, password, personal_ID, role, imagePath } = userDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }, { personal_ID }],
    });

    if (existingUser) {
      throw new ConflictException(`User ${username} or email ${email} already exists`);
    }

    // Check if the role exists
    const roleEntity = await this.roleRepository.findOne({ where: { id: role } });
    if (!roleEntity) {
      throw new NotFoundException(`Role with ID "${role}" not found`);
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user object
    const newUser = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
      role: roleEntity,
      image: imagePath,
    });

    usersToCreate.push(newUser);
  }

  // Save all users in bulk
  return this.userRepository.save(usersToCreate);
}


async getUsersWithPagination(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  const [users, total] = await this.userRepository.findAndCount({
    skip: offset,
    take: limit,
    relations: ['role'], // Load role relation
    order: { user_id: 'ASC' }, // Optional sorting
  });

  return {
    totalUsers: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
    data: users,
  };
}



async changeStatus(user_id: number, status: string): Promise<{ message: string }> {
  // Validate status
  if (!['on', 'off'].includes(status)) {
    throw new BadRequestException('Invalid status. Use "on" or "off"');
  }

  // Find the user by ID
  const user = await this.userRepository.findOne({ where: { user_id } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check if status is already the same
  if (user.status === status) {
    throw new BadRequestException(`User is already ${status}`);
  }

  // Update status
  user.status = status;
  await this.userRepository.save(user);

  return { message: `User status changed to ${status}` };
}
}

