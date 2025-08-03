export enum ServerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum MissionStatus {
  APPROVED = 'APPROVED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export enum SideType {
  BLUE = 'BLUE',
  RED = 'RED',
  UNASSIGNED = 'UNASSIGNED',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  BANNED = 'BANNED',
}

export enum UserRole {
  OWNER = 'OWNER',
  TECH_ADMIN = 'TECH_ADMIN',
  GAME_ADMIN = 'GAME_ADMIN',
  USER = 'USER',
}

export enum SoldierAbility {
  COMMANDER = 'COMMANDER',
  MEDIC = 'MEDIC',
  SNIPER = 'SNIPER',
  ANTI_TANK = 'ANTI_TANK',
  ANTI_AIR = 'ANTI_AIR',
  HELI_PILOT = 'HELI_PILOT',
  JET_PILOT = 'JET_PILOT',
  TANK_CREW = 'TANK_CREW',
  VEHICLE_CREW = 'VEHICLE_CREW',
}

enum SquadInviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  LEAVED = 'LEAVED',
}

export type PaginatedRequest<T = { take: number; skip: number }> = {
  take?: number;
  skip?: number;
} & T;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  take: number;
  skip: number;
};

export type Side = {
  id: string;
  name: string;
  type: SideType;
  leaderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  serverId: string | null;
  leader: User | null;
  server: Server | null;
  squads: Squad[];
};

export type Server = {
  id: string;
  name: string;
  status: ServerStatus;
  createdAt: Date;
  updatedAt: Date;
  ip: string;
  port: number;
  sides: Side[];
  info?: {
    name: string;
    game: string;
    map: string;
    maxPlayers: number;
    players: number;
    ping: number;
  };
};

export type User = {
  id: string;
  email: string;
  nickname: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  abilities: SoldierAbility[];
  squadId: string | null;
  activationToken: string | null;
  activationTokenExpiresAt: Date | null;
  status: UserStatus;
  role: UserRole;
  resetPasswordToken: string | null;
  resetPasswordTokenExpiresAt: Date | null;
  avatarUrl: string | null;
  bannedUntil: Date | null;
  missions: [];
  side: Side | null;
  leadingSquad: Squad | null;
  squadInvites: SquadInvitation[];
  squad: Squad | null;
};

export type Squad = {
  id: string;
  name: string;
  leaderId: string;
  sideId: string;
  createdAt: Date;
  updatedAt: Date;
  activeCount: number;
  description: string | null;
  logoUrl: string | null;
  tag: string;
  leader: User;
  side: Side;
  invites: SquadInvitation[];
  members: User[];
};

export type SquadInvitation = {
  id: string;
  userId: string;
  squadId: string;
  status: SquadInviteStatus;
  createdAt: Date;
  updatedAt: Date;
  squad: Squad;
  user: User;
};

export type SignUpDto = {
  email: string;
  password: string;
  nickname: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
  refreshToken: string;
};

export type ChangePasswordDto = {
  oldPassword: string;
  newPassword: string;
};

export type FindUsersDto = PaginatedRequest<{
  search?: string;
}>;

export type BanUserDto = {
  userId: string;
  bannedUntil: Date | null;
};

export type UnbanUserDto = {
  userId: string;
};

export type UpdateServerDto = {
  id: string;
  name: string;
  ip: string;
  port: number;
};
