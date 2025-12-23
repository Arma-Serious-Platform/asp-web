export enum MissionGameSide {
  BLUE = 'BLUE',
  RED = 'RED',
  GREEN = 'GREEN',
}

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
  avatar: {
    name: string;
    url: string;
  } | null;
  bannedUntil: Date | null;
  missions: [];
  side: Side | null;
  leadingSquad: Squad | null;
  squadInvites: SquadInvitation[];
  squad: Squad | null;
  telegramUrl?: string;
  discordUrl?: string;
  twitchUrl?: string;
  youtubeUrl?: string;
};

export type UpdateUserDto = {
  nickname?: string;
  telegramUrl?: string;
  discordUrl?: string;
  twitchUrl?: string;
  youtubeUrl?: string;
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
  logo: {
    id: string;
    url: string;
  } | null;
  tag: string;
  leader: User;
  side: Side;
  invites: SquadInvitation[];
  members: User[];
  _count: {
    members: number;
    invites: number;
  };
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

export type ForgotPasswordDto = {
  email: string;
};

export type ConfirmForgotPasswordDto = {
  token: string;
  newPassword: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type RefreshTokenDto = {
  refreshToken: string;
}

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

export type FindServersDto = PaginatedRequest<{
  search?: string;
  status?: ServerStatus;
  fetchActualInfo?: boolean;
}>;

export type UpdateServerDto = {
  id: string;
  name?: string;
  ip?: string;
  port?: number;
  status?: ServerStatus;
};

export type CreateServerDto = {
  name: string;
  ip: string;
  port: number;
  status: ServerStatus;
};

export type FindSidesDto = PaginatedRequest<{
  type?: SideType;
}>;

export type FindSquadsDto = PaginatedRequest<{
  search?: string;
  sideType?: SideType;
}>;

export type InviteToSquadDto = {
  userId: string;
};

export type CreateSquadDto = {
  name: string;
  tag: string;
  description: string;
  leaderId: string;
  sideId: string;
  activeCount?: number;
  logo?: File;
};

export type UpdateSquadDto = {
  id: string;
  name?: string;
  tag?: string;
  description?: string;
  leaderId?: string;
  sideId?: string;
  activeCount?: number;
  logo?: File;
};

export type FindMissionsDto = PaginatedRequest<{
  search?: string;
  status?: MissionStatus;
  authorId?: string;
}>;

export type CreateMissionDto = {
  name: string;
  description: string;
  image?: File;
};

export type Mission = {
  id: string;
  name: string;
  description: string;
  status: MissionStatus;
  imageId: string | null;
  image?: {
    id: string;
    url: string;
  }
  versions: MissionVersion[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type MissionVersion = {
  id: string;
  version: string;
  missionId: string;
  attackSideType: MissionGameSide;
  defenseSideType: MissionGameSide;
  attackSideSlots: number;
  defenseSideSlots: number;
  attackSideName: string;
  defenseSideName: string;
  fileId: string;
  file?: {
    id: string;
    url: string;
  }
  rating?: number;
  attackSideWeaponry?: MissionWeaponry[];
  defenseSideWeaponry?: MissionWeaponry[];
  createdAt: string;
  updatedAt: string;
}

export type MissionWeaponry = {
  id: string;
  name: string;
  description?: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateMissionWeaponryDto = {
  name: string;
  description?: string;
  count: number;
}

export type CreateMissionVersionDto = {
  version: string;
  missionId: string;
  attackSideType: MissionGameSide;
  defenseSideType: MissionGameSide;
  attackSideSlots: number;
  defenseSideSlots: number;
  attackSideName: string;
  defenseSideName: string;
  file: File;
  rating?: number;
  attackSideWeaponry?: CreateMissionWeaponryDto[];
  defenseSideWeaponry?: CreateMissionWeaponryDto[];
}