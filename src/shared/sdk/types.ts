/**
 * Compatibility barrel — all SDK types/schemas re-exported from domain modules.
 * Prefer importing from domain paths for new code.
 */

export {
  MissionGameSide,
  ServerStatus,
  MissionStatus,
  MissionType,
  MissionObjective,
  State,
  SideType,
  UserStatus,
  UserRole,
  SquadRole,
  SoldierAbility,
  MissionGameSideSchema,
  ServerStatusSchema,
  MissionStatusSchema,
  MissionTypeSchema,
  MissionObjectiveSchema,
  StateSchema,
  SideTypeSchema,
  UserStatusSchema,
  UserRoleSchema,
  SquadRoleSchema,
  SoldierAbilitySchema,
  dateLikeSchema,
  fileRefSchema,
  missionCommentMessageSchema,
  messageAttachmentItemSchema,
  paginatedResponseSchema,
} from './api-model';

export type {
  PaginatedRequest,
  PaginatedResponse,
  MissionCommentMessage,
  MessageAttachmentItem,
} from './api-model';

export {
  UserSchema,
  UserWarningSchema,
  UserPunishmentTypeSchema,
  UserPunishmentType,
  UserPunishmentSchema,
  UserHistoryEventTypeSchema,
  UserHistoryEventType,
  UserHistoryEventPayloadSchema,
  UserHistoryEventSchema,
  ChangeNicknameDtoSchema,
  ChangeUserNicknameDtoSchema,
  CreateUserWarningDtoSchema,
  UpdateMeDtoSchema,
  UpdateUserDtoSchema,
  FindUsersDtoSchema,
  BanUserDtoSchema,
  UnbanUserDtoSchema,
  ChangeUserRoleDtoSchema,
} from './users/users.schemas';

export type {
  User,
  UserWarning,
  UserPunishment,
  UserHistoryEventPayload,
  UserHistoryEvent,
  ChangeNicknameDto,
  ChangeUserNicknameDto,
  CreateUserWarningDto,
  UpdateMeDto,
  UpdateUserDto,
  FindUsersDto,
  BanUserDto,
  UnbanUserDto,
  ChangeUserRoleDto,
} from './users/users.schemas';

export {
  SignUpDtoSchema,
  ForgotPasswordDtoSchema,
  ResetPasswordDtoSchema,
  ConfirmForgotPasswordDtoSchema,
  SessionLoginDtoSchema,
  UserSessionSchema,
  LoginDtoSchema,
  LoginUserDtoSchema,
  RefreshTokenDtoSchema,
  SessionLoginResponseSchema,
  TwoFactorSetupResponseSchema,
  TwoFactorStatusResponseSchema,
  EnableTwoFactorDtoSchema,
  DisableTwoFactorDtoSchema,
  VerifyTwoFactorLoginDtoSchema,
  EnableTwoFactorResponseSchema,
  LoginResponseSchema,
  ChangePasswordDtoSchema,
} from './auth/auth.schemas';

export type {
  SignUpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ConfirmForgotPasswordDto,
  SessionLoginDto,
  UserSession,
  LoginDto,
  LoginUserDto,
  RefreshTokenDto,
  SessionLoginResponse,
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
  EnableTwoFactorDto,
  DisableTwoFactorDto,
  EnableTwoFactorResponse,
  VerifyTwoFactorLoginDto,
  LoginResponse,
  ChangePasswordDto,
} from './auth/auth.schemas';

export {
  IslandSchema,
  FindIslandsDtoSchema,
  CreateIslandDtoSchema,
  UpdateIslandDtoSchema,
} from './islands/islands.schemas';

export type { Island, FindIslandsDto, CreateIslandDto, UpdateIslandDto } from './islands/islands.schemas';

export {
  ServerSchema,
  FindServersDtoSchema,
  UpdateServerDtoSchema,
  CreateServerDtoSchema,
} from './servers/servers.schemas';

export type { Server, FindServersDto, UpdateServerDto, CreateServerDto } from './servers/servers.schemas';

export {
  SideSchema,
  FindSidesDtoSchema,
  CreateSideDtoSchema,
  UpdateSideDtoSchema,
} from './sides/sides.schemas';

export type { Side, FindSidesDto, CreateSideDto, UpdateSideDto } from './sides/sides.schemas';

export {
  SpecializationSchema,
  CreateSpecializationDtoSchema,
  UpdateSpecializationDtoSchema,
  SetUserSpecializationsDtoSchema,
} from './specializations/specializations.schemas';

export type {
  Specialization,
  CreateSpecializationDto,
  UpdateSpecializationDto,
  SetUserSpecializationsDto,
} from './specializations/specializations.schemas';

export {
  SquadSchema,
  SquadInviteStatusSchema,
  SquadInviteStatus,
  SquadJoinRequestStatusSchema,
  SquadDescriptionSchema,
  SquadJoinRequestSchema,
  SquadInvitationSchema,
  FindSquadsDtoSchema,
  InviteToSquadDtoSchema,
  UpdateSquadMemberRoleDtoSchema,
  CreateSquadDtoSchema,
  UpdateSquadDtoSchema,
  UpdateMySquadDtoSchema,
  LeaveSquadDtoSchema,
} from './squads/squads.schemas';

export type {
  Squad,
  SquadJoinRequestStatus,
  SquadDescription,
  SquadJoinRequest,
  SquadInvitation,
  FindSquadsDto,
  InviteToSquadDto,
  UpdateSquadMemberRoleDto,
  CreateSquadDto,
  UpdateSquadDto,
  UpdateMySquadDto,
  LeaveSquadDto,
} from './squads/squads.schemas';

export {
  MissionSchema,
  MissionVersionSchema,
  MissionCommentSchema,
  MissionWeaponrySchema,
  MissionVersionScreenshotSchema,
  FindMissionsDtoSchema,
  CreateMissionDtoSchema,
  UpdateMissionDtoSchema,
  ChangeMissionStateDtoSchema,
  CreateMissionWeaponryDtoSchema,
  CreateMissionVersionDtoSchema,
  UpdateMissionVersionDtoSchema,
  CreateMissionCommentDtoSchema,
  UpdateMissionCommentDtoSchema,
  FindMissionCommentsDtoSchema,
} from './missions/missions.schemas';

export type {
  Mission,
  MissionVersion,
  MissionComment,
  MissionWeaponry,
  MissionVersionScreenshot,
  FindMissionsDto,
  CreateMissionDto,
  UpdateMissionDto,
  ChangeMissionStateDto,
  CreateMissionWeaponryDto,
  CreateMissionVersionDto,
  UpdateMissionVersionDto,
  CreateMissionCommentDto,
  UpdateMissionCommentDto,
  FindMissionCommentsDto,
} from './missions/missions.schemas';

export {
  WeekendSchema,
  GameSchema,
  FindWeekendsDtoSchema,
  CreateGameDtoSchema,
  CreateWeekendDtoSchema,
  UpdateWeekendDtoSchema,
  UpdateGameDtoSchema,
} from './weekends/weekends.schemas';

export type {
  Weekend,
  Game,
  FindWeekendsDto,
  CreateGameDto,
  CreateWeekendDto,
  UpdateWeekendDto,
  UpdateGameDto,
} from './weekends/weekends.schemas';

export {
  HeadquartersSquadShortSchema,
  HeadquartersSlotSchema,
  HeadquartersGameShortSchema,
  HeadquartersSideShortSchema,
  HeadquartersCommanderSchema,
  HeadquartersGamePlanSchema,
  UpdateHeadquartersGamePlanDtoSchema,
  UpdateHeadquartersGamePlanSlotDtoSchema,
  AssignHeadquartersSlotSquadDtoSchema,
  HeadquartersCommentSchema,
  FindHeadquartersCommentsDtoSchema,
  CreateHeadquartersCommentDtoSchema,
  UpdateHeadquartersCommentDtoSchema,
} from './headquarters/headquarters.schemas';

export type {
  HeadquartersSquadShort,
  HeadquartersSlot,
  HeadquartersGameShort,
  HeadquartersSideShort,
  HeadquartersCommander,
  HeadquartersGamePlan,
  UpdateHeadquartersGamePlanDto,
  UpdateHeadquartersGamePlanSlotDto,
  AssignHeadquartersSlotSquadDto,
  HeadquartersComment,
  FindHeadquartersCommentsDto,
  CreateHeadquartersCommentDto,
  UpdateHeadquartersCommentDto,
} from './headquarters/headquarters.schemas';

export {
  ChatTypeSchema,
  ChatType,
  ChatSchema,
  CreateChatDtoSchema,
  AddChatMembersDtoSchema,
  UpdateChatMessageDtoSchema,
} from './chat/chat.schemas';

export type { Chat, CreateChatDto, AddChatMembersDto, UpdateChatMessageDto } from './chat/chat.schemas';

export { RulesContentSchema, UpdateRulesDtoSchema } from './rules/rules.schemas';

export type { RulesContent, UpdateRulesDto } from './rules/rules.schemas';
