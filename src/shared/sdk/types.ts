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

export enum MissionType {
  SG = 'SG',
  mini = 'mini',
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
  MINI_ADMIN = 'MINI_ADMIN',
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
  steamId: string | null;
  isMissionReviewer: boolean;
  resetPasswordToken: string | null;
  resetPasswordTokenExpiresAt: Date | null;
  avatar: {
    name: string;
    url: string;
  } | null;
  bannedUntil: Date | null;
  missions: Mission[];
  side: Side | null;
  leadingSquad: Squad | null;
  squadInvites: SquadInvitation[];
  squad: Squad | null;
  telegramUrl?: string;
  discordUrl?: string;
  twitchUrl?: string;
  youtubeUrl?: string;
  _count?: {
    missions: number;
  };
};

export type UpdateMeDto = {
  nickname?: string;
  email?: string;
  steamId?: string;
  telegramUrl?: string;
  discordUrl?: string;
  youtubeUrl?: string;
  twitchUrl?: string;
};

/** @deprecated Use UpdateMeDto for PATCH /users/me */
export type UpdateUserDto = UpdateMeDto;

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

export type ResetPasswordDto = {
  token: string;
  newPassword: string;
};

/** @deprecated Use ResetPasswordDto */
export type ConfirmForgotPasswordDto = ResetPasswordDto;

/** @deprecated Use LoginUserDto (emailOrNickname + password) */
export type LoginDto = {
  email: string;
  password: string;
};

export type LoginUserDto = {
  emailOrNickname: string;
  password: string;
};

export type RefreshTokenDto = {
  refreshToken: string;
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
  status?: UserStatus;
  role?: UserRole;
  hasSquad?: boolean;
}>;

/** bannedUntil is sent as path param (ISO string). Required by API. */
export type BanUserDto = {
  userId: string;
  bannedUntil: string | Date;
};

export type UnbanUserDto = {
  userId: string;
};

/** Body for POST /users/change-role */
export type ChangeUserRoleDto = {
  id: string;
  role: UserRole;
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
  search?: string;
}>;

export type CreateSideDto = {
  name?: string;
  description?: string;
  serverId?: string;
};

export type UpdateSideDto = Record<string, unknown>;

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
  islandId?: string;
  minSlots?: number;
  maxSlots?: number;
  missionType?: MissionType;
}>;

export type CreateMissionDto = {
  islandId: string;
  name: string;
  description: string;
  missionType: MissionType;
  image?: File;
};

export type UpdateMissionDto = {
  id: string;
} & Partial<CreateMissionDto>;

export type Island = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type Mission = {
  id: string;
  name: string;
  description: string;
  missionType: MissionType;
  imageId: string | null;
  image?: {
    id: string;
    url: string;
  };
  island: Island;
  author: User;
  missionVersions: MissionVersion[];
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
  changesDescription: string | null;
  fileId: string;
  file?: {
    id: string;
    url: string;
  };
  rating?: number;
  weaponry?: MissionWeaponry[];
  attackScreenshots?: MissionVersionScreenshot[];
  defenseScreenshots?: MissionVersionScreenshot[];
  status: MissionStatus;
  createdAt: string;
  updatedAt: string;
};

export type MissionVersionScreenshot = {
  id: string;
  url: string;
};

export type MissionWeaponry = {
  id: string;
  name: string;
  description?: string;
  count: number;
  type: MissionGameSide;
  createdAt: string;
  updatedAt: string;
};

export type CreateMissionWeaponryDto = {
  name: string;
  description?: string;
  count: number;
  type: MissionGameSide;
};

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
  attackScreenshots?: File[];
  defenseScreenshots?: File[];
  rating?: number;
  weaponry?: CreateMissionWeaponryDto[];
};

export type UpdateMissionVersionDto = {
  version?: string;
  attackSideType?: MissionGameSide;
  defenseSideType?: MissionGameSide;
  attackSideSlots?: number;
  defenseSideSlots?: number;
  attackSideName?: string;
  defenseSideName?: string;
  file?: File;
  attackScreenshots?: File[];
  defenseScreenshots?: File[];
  removeAttackScreenshotIds?: string[];
  removeDefenseScreenshotIds?: string[];
  rating?: number;
  weaponry?: CreateMissionWeaponryDto[];
};

/* Weekends & Games */

export type Game = {
  id: string;
  name?: string;
  date: string;
  position: number;
  missionId: string;
  missionVersionId: string;
  attackSideId: string;
  defenseSideId: string;
  adminId: string | null;
  weekendId?: string;
  weekend?: Weekend;
  missionVersion: MissionVersion;
  mission: Mission;
  admin?: User | null;
};

export type Weekend = {
  id: string;
  name: string;
  description?: string;
  published: boolean;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  games?: Game[];
};

export type FindWeekendsDto = PaginatedRequest<{
  search?: string;
  published?: boolean;
}>;

export type CreateGameDto = {
  date: string;
  position: number;
  missionId: string;
  missionVersionId: string;
  attackSideId: string;
  defenseSideId: string;
  adminId?: string | null;
};

export type CreateWeekendDto = {
  name: string;
  description?: string;
  games: CreateGameDto[];
  published?: boolean;
  publishedAt?: string | null;
};

export type UpdateWeekendDto = {
  name?: string;
  description?: string;
  published?: boolean;
  publishedAt?: string | null;
};

export type UpdateGameDto = {
  date?: string;
  position?: number;
  missionId?: string;
  missionVersionId?: string;
  attackSideId?: string;
  defenseSideId?: string;
  adminId?: string | null;
};

/* Mission comments */

/** Lexical editor state / JSON content (object) */
export type MissionCommentMessage = Record<string, unknown>;

export type MissionComment = {
  id: string;
  /** Lexical JSON content */
  message: MissionCommentMessage;
  missionId: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  user?: User;
};

export type CreateMissionCommentDto = {
  /** Lexical JSON content */
  message: MissionCommentMessage;
  missionId: string;
};

export type UpdateMissionCommentDto = {
  /** Lexical JSON content */
  message: MissionCommentMessage;
};

export type FindMissionCommentsDto = PaginatedRequest<{
  search?: string;
  missionId?: string;
}>;

/* Headquarters */

export type HeadquartersSquadShort = {
  id: string;
  name: string;
  tag: string;
  logo?: {
    id: string;
    url: string;
  } | null;
};

export type HeadquartersSlot = {
  id: string;
  slotNumber: string;
  name: string | null;
  weaponry: string | null;
  slotCount: number | null;
  comment: string | null;
  spawnPoint: string | null;
  assignedSquads: HeadquartersSquadShort[];
  wantedSquads: HeadquartersSquadShort[];
};

export type HeadquartersGameShort = {
  id: string;
  date: string;
  position: number;
  mission?: {
    id: string;
    name: string;
  };
  missionVersion?: {
    id: string;
    version: string;
  };
};

export type HeadquartersSideShort = {
  id: string;
  name: string;
  type: SideType;
};

export type HeadquartersGamePlan = {
  id: string;
  gameId: string;
  planUrl: string | null;
  gameCommanderId: string | null;
  game?: HeadquartersGameShort;
  side?: HeadquartersSideShort;
  slots: HeadquartersSlot[];
};

export type UpdateHeadquartersGamePlanDto = {
  planUrl?: string | null;
};

export type UpdateHeadquartersGamePlanSlotDto = {
  name?: string | null;
  weaponry?: string | null;
  slotCount?: number | null;
  comment?: string | null;
  spawnPoint?: string | null;
};

export type AssignHeadquartersSlotSquadDto = {
  squadId: string;
};

export type HeadquartersComment = {
  id: string;
  gamePlanId: string;
  userId: string;
  replyId?: string | null;
  message: MissionCommentMessage;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'nickname' | 'avatar'>;
  replyTo?: {
    id: string;
    userId: string;
    message: MissionCommentMessage;
    createdAt: string;
    user?: Pick<User, 'id' | 'nickname'>;
  } | null;
};

export type FindHeadquartersCommentsDto = PaginatedRequest<{
  replyId?: string;
}>;

export type CreateHeadquartersCommentDto = {
  message: MissionCommentMessage;
  replyId?: string;
};

export type UpdateHeadquartersCommentDto = {
  message?: MissionCommentMessage;
  replyId?: string | null;
};

/* Chats */

export enum ChatType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export type Chat = {
  id: string;
  name?: string;
  type: ChatType;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateChatDto = {
  type: ChatType;
  userIds: string[];
  name?: string;
};

export type LeaveSquadDto = {
  newLeaderId?: string;
};
