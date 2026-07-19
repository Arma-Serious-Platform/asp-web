'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import toast from 'react-hot-toast';
import { observer } from 'mobx-react-lite';
import {
  CheckIcon,
  LoaderIcon,
  LogOutIcon,
  MessageCircleIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

import { api } from '@/shared/sdk';
import { Chat, ChatType, MissionCommentMessage, User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Avatar } from '@/shared/ui/organisms/avatar';
import { cn } from '@/shared/utils/cn';
import { MessageComposer, MessageComposerSubmitPayload } from '@/features/chat/message-composer/ui';
import { MessageContent } from '@/entities/comment/lexical-message';
import { MessageAttachments } from '@/entities/attachment/ui/message-attachments';
import { MessageAttachmentItem, normalizeMessageAttachments } from '@/entities/attachment/lib';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { session } from '@/entities/session/model';
import { env } from '@/shared/config/env';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/organisms/dialog';

dayjs.extend(relativeTime);
dayjs.locale('uk');

type ProfileChatProps = {
  initialUserId?: string;
  onInitialUserHandled?: () => void;
};

type ChatMessage = {
  id: string;
  chatId: string;
  userId?: string;
  user?: User;
  message: MissionCommentMessage;
  attachments?: MessageAttachmentItem[];
  createdAt?: string;
  updatedAt?: string;
  editedAt?: string;
};

type ChatDetails = {
  chat: Chat;
  participantUserIds: string[];
  participantUsers: User[];
};

const normalizeRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object') return {};
  return value as Record<string, unknown>;
};

const normalizeChat = (value: unknown): Chat | null => {
  const record = normalizeRecord(value);
  if (typeof record.id !== 'string') return null;

  return {
    id: record.id,
    type: (record.type as ChatType) || ChatType.DIRECT,
    name: typeof record.name === 'string' ? record.name : undefined,
    creatorId: typeof record.creatorId === 'string' ? record.creatorId : undefined,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
  };
};

const directChatPairKey = (a: string, b: string) => (a < b ? `${a}::${b}` : `${b}::${a}`);

/** Coalesces concurrent direct-chat creates for the same pair (e.g. React Strict Mode or parallel handlers). */
const inflightDirectChatCreates = new Map<string, Promise<Chat>>();

function createDirectChatOnce(userIdA: string, userIdB: string, name?: string): Promise<Chat> {
  const key = directChatPairKey(userIdA, userIdB);
  const existing = inflightDirectChatCreates.get(key);
  if (existing) return existing;

  const created = api
    .createChat({
      type: ChatType.DIRECT,
      userIds: [userIdA, userIdB],
      ...(name ? { name } : {}),
    })
    .then(({ data }) => {
      const chat = normalizeChat(data);
      if (!chat) throw new Error('Invalid chat payload');
      return chat;
    })
    .finally(() => {
      inflightDirectChatCreates.delete(key);
    });

  inflightDirectChatCreates.set(key, created);
  return created;
}

const normalizeChatMessage = (value: unknown, chatId: string): ChatMessage | null => {
  const record = normalizeRecord(value);
  if (typeof record.id !== 'string') return null;

  const author = normalizeRecord(record.user);
  const user = typeof author.id === 'string' ? (author as User) : undefined;

  const parseJsonIfPossible = (input: string): unknown => {
    const trimmed = input.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return input;
    }
    try {
      return JSON.parse(trimmed);
    } catch {
      return input;
    }
  };

  const extractMessagePayload = (input: unknown, depth = 0): unknown => {
    if (depth > 5) return undefined;
    if (typeof input === 'string') {
      return parseJsonIfPossible(input);
    }
    if (!input || typeof input !== 'object') return undefined;

    const obj = normalizeRecord(input);
    if (obj.root && typeof obj.root === 'object') return obj;
    if (typeof obj.text === 'string') return obj.text;

    const keys = ['message', 'content', 'payload', 'body', 'data', 'value', 'text', 'messageText'] as const;
    for (const key of keys) {
      if (!(key in obj)) continue;
      const nested = extractMessagePayload(obj[key], depth + 1);
      if (nested !== undefined) return nested;
    }

    return undefined;
  };

  const normalizeMessagePayload = (raw: unknown): MissionCommentMessage => {
    const extracted = extractMessagePayload(raw);
    if (typeof extracted === 'string') {
      return { text: extracted } as MissionCommentMessage;
    }
    if (extracted && typeof extracted === 'object') {
      return extracted as MissionCommentMessage;
    }
    return { text: '' } as MissionCommentMessage;
  };

  const rawMessage = record.content ?? record.message;

  return {
    id: record.id,
    chatId: typeof record.chatId === 'string' ? record.chatId : chatId,
    userId: typeof record.userId === 'string' ? record.userId : user?.id,
    user,
    message: normalizeMessagePayload(rawMessage),
    attachments: normalizeMessageAttachments(record.attachments),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
    editedAt: typeof record.editedAt === 'string' ? record.editedAt : undefined,
  };
};

const getUsersFromUnknownArray = (value: unknown): User[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      const record = normalizeRecord(item);
      if (typeof record.id === 'string' && typeof record.nickname === 'string') {
        return record as User;
      }

      const nestedUser = normalizeRecord(record.user);
      if (typeof nestedUser.id === 'string') {
        return nestedUser as User;
      }

      return null;
    })
    .filter((user): user is User => Boolean(user?.id));
};

const normalizeChatDetails = (chat: Chat, value: unknown): ChatDetails => {
  const record = normalizeRecord(value);
  const possibleUsers = [
    ...getUsersFromUnknownArray(record.users),
    ...getUsersFromUnknownArray(record.participants),
    ...getUsersFromUnknownArray(record.members),
  ];
  const uniqueUsers = possibleUsers.filter((user, index, arr) => arr.findIndex(item => item.id === user.id) === index);

  return {
    chat,
    participantUserIds: uniqueUsers.map(user => user.id),
    participantUsers: uniqueUsers,
  };
};

const getArrayPayload = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const record = normalizeRecord(value);
  if (Array.isArray(record.data)) return record.data as unknown[];
  if (Array.isArray(record.items)) return record.items as unknown[];
  return [];
};

export const ProfileChat = observer(function ProfileChat({ initialUserId, onInitialUserHandled }: ProfileChatProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreateChatDialogOpen, setIsCreateChatDialogOpen] = useState(false);
  const [selectedUserIdsForNewChat, setSelectedUserIdsForNewChat] = useState<string[]>([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatUserSearch, setNewChatUserSearch] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [renameChatName, setRenameChatName] = useState('');
  const [isSavingChatRename, setIsSavingChatRename] = useState(false);
  const [isLeavingChat, setIsLeavingChat] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [addMembersSearch, setAddMembersSearch] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [activeChatParticipantIds, setActiveChatParticipantIds] = useState<string[]>([]);
  const [userByChatId, setUserByChatId] = useState<Record<string, User | undefined>>({});
  const [directChatByUserId, setDirectChatByUserId] = useState<Record<string, string>>({});
  const [chatActivityById, setChatActivityById] = useState<Record<string, string>>({});
  const handledInitialUserIdRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const activeChat = useMemo(() => chats.find(chat => chat.id === activeChatId) ?? null, [activeChatId, chats]);
  const currentUserId = session.user.user?.id;
  const isActiveChatCreator = Boolean(activeChat?.creatorId && activeChat.creatorId === currentUserId);
  const isCommunicationMuted = session.isCommunicationMuted;
  const composerDisabled = isSending || isCommunicationMuted;

  const bumpChatActivity = useCallback((chatId: string, at?: string) => {
    const timestamp = at ?? new Date().toISOString();
    setChatActivityById(prev => {
      const next = { ...prev, [chatId]: timestamp };
      setChats(prevChats =>
        [...prevChats].sort(
          (a, b) =>
            dayjs(next[b.id] ?? b.updatedAt ?? b.createdAt ?? '1970-01-01T00:00:00.000Z').valueOf() -
            dayjs(next[a.id] ?? a.updatedAt ?? a.createdAt ?? '1970-01-01T00:00:00.000Z').valueOf(),
        ),
      );
      return next;
    });
  }, []);

  const loadMessages = useCallback(
    async (chatId: string) => {
      setIsMessagesLoading(true);
      try {
        const { data } = await api.findChatMessages(chatId);
        const payload = Array.isArray(data) ? data : (data.data ?? []);
        const normalized = payload
          .map(item => normalizeChatMessage(item, chatId))
          .filter((item): item is ChatMessage => Boolean(item));
        setMessages(normalized);
        if (normalized.length > 0) {
          const last = normalized[normalized.length - 1];
          bumpChatActivity(chatId, last.createdAt ?? last.updatedAt);
        }
      } catch (error) {
        console.error(error);
        setMessages([]);
        toast.error('Не вдалося завантажити повідомлення');
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [bumpChatActivity],
  );

  const handleUpdateMessage = useCallback(
    async (message: ChatMessage, payload: MessageComposerSubmitPayload) => {
      if (!activeChat) return;

      setIsSending(true);
      try {
        await api.updateChatMessage(activeChat.id, message.id, {
          content: payload.lexicalState,
          attachments: payload.attachments,
          removedAttachmentIds: payload.removedAttachmentIds,
        });
        setEditingMessageId(null);
        await loadMessages(activeChat.id);
        toast.success('Повідомлення оновлено');
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося оновити повідомлення');
      } finally {
        setIsSending(false);
      }
    },
    [activeChat, loadMessages],
  );

  const confirmDeleteMessage = useCallback(async () => {
    if (!activeChat || !messageToDelete) return;

    setIsDeletingMessage(true);
    try {
      await api.deleteChatMessage(activeChat.id, messageToDelete.id);
      setMessages(prev => prev.filter(item => item.id !== messageToDelete.id));
      setEditingMessageId(current => (current === messageToDelete.id ? null : current));
      setMessageToDelete(null);
      toast.success('Повідомлення видалено');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося видалити повідомлення');
    } finally {
      setIsDeletingMessage(false);
    }
  }, [activeChat, messageToDelete]);

  const loadUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const { data } = await api.findUsers({ take: 1000, skip: 0 });
      setAllUsers(data.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити користувачів');
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const hydrateDirectChatPartners = useCallback(
    async (items: Chat[]) => {
      const nextUserByChatId: Record<string, User | undefined> = {};
      const nextDirectByUserId: Record<string, string> = {};

      const details = await Promise.all(
        items.map(async chat => {
          try {
            const { data } = await api.findChatById(chat.id);
            return normalizeChatDetails(chat, data);
          } catch (error) {
            console.error(error);
            return { chat, participantUserIds: [], participantUsers: [] } as ChatDetails;
          }
        }),
      );

      details.forEach(detail => {
        if (detail.chat.type !== ChatType.DIRECT) return;
        const partner = detail.participantUsers.find(user => user.id !== currentUserId);
        if (!partner) return;
        nextUserByChatId[detail.chat.id] = partner;
        nextDirectByUserId[partner.id] = detail.chat.id;
      });

      setUserByChatId(prev => ({ ...nextUserByChatId, ...prev }));
      setDirectChatByUserId(nextDirectByUserId);
    },
    [currentUserId],
  );

  const addOrActivateDirectChat = useCallback(
    async (targetUser: User, notifyOnError = true) => {
      if (!currentUserId) {
        if (notifyOnError) {
          toast.error('Не вдалося визначити поточного користувача');
        }
        return;
      }
      if (targetUser.id === currentUserId) {
        return;
      }

      const existingChatId = directChatByUserId[targetUser.id];
      if (existingChatId) {
        setActiveChatId(existingChatId);
        return;
      }

      setIsCreatingChat(true);
      try {
        const chat = await createDirectChatOnce(currentUserId, targetUser.id);

        setChats(prev => (prev.some(item => item.id === chat.id) ? prev : [chat, ...prev]));
        setUserByChatId(prev => ({ ...prev, [chat.id]: targetUser }));
        setDirectChatByUserId(prev => ({ ...prev, [targetUser.id]: chat.id }));
        bumpChatActivity(chat.id, chat.updatedAt ?? chat.createdAt);
        setActiveChatId(chat.id);
      } catch (error) {
        console.error(error);
        if (notifyOnError) {
          toast.error('Не вдалося відкрити чат');
        }
      } finally {
        setIsCreatingChat(false);
      }
    },
    [bumpChatActivity, currentUserId, directChatByUserId],
  );

  const toggleUserInSelection = useCallback(
    (userId: string) => {
      if (!currentUserId) return;
      if (userId === currentUserId) return;
      setSelectedUserIdsForNewChat(prev =>
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId],
      );
    },
    [currentUserId],
  );

  const createSelectedChat = useCallback(async () => {
    if (!currentUserId) {
      toast.error('Не вдалося визначити поточного користувача');
      return;
    }

    if (!selectedUserIdsForNewChat.includes(currentUserId)) {
      toast.error('Поточний користувач має бути учасником чату');
      return;
    }

    const selectedOtherUserIds = selectedUserIdsForNewChat.filter(id => id !== currentUserId);
    if (selectedOtherUserIds.length === 0) {
      toast.error('Оберіть щонайменше одного користувача');
      return;
    }

    if (selectedOtherUserIds.length === 1) {
      const existingDirectChatId = directChatByUserId[selectedOtherUserIds[0]];
      if (existingDirectChatId) {
        toast.error('Чат з цим користувачем вже існує');
        return;
      }
    }

    setIsCreatingChat(true);
    try {
      const type = selectedOtherUserIds.length === 1 ? ChatType.DIRECT : ChatType.GROUP;
      const trimmedName = newChatName.trim();

      let chat: Chat | null = null;
      if (type === ChatType.DIRECT) {
        const otherId = selectedOtherUserIds[0];
        chat = await createDirectChatOnce(currentUserId, otherId, trimmedName || undefined);
      } else {
        const { data } = await api.createChat({
          type,
          userIds: selectedUserIdsForNewChat,
          ...(trimmedName ? { name: trimmedName } : {}),
        });
        chat = normalizeChat(data);
      }
      if (!chat) return;

      setChats(prev => (prev.some(item => item.id === chat.id) ? prev : [chat, ...prev]));
      bumpChatActivity(chat.id, chat.updatedAt ?? chat.createdAt);

      if (type === ChatType.DIRECT) {
        const partnerId = selectedOtherUserIds[0];
        const partner = allUsers.find(user => user.id === partnerId);
        if (partner) {
          setUserByChatId(prev => ({ ...prev, [chat.id]: partner }));
          setDirectChatByUserId(prev => ({ ...prev, [partner.id]: chat.id }));
        }
      } else {
        await hydrateDirectChatPartners([chat]);
      }

      setActiveChatId(chat.id);
      setIsCreateChatDialogOpen(false);
      setSelectedUserIdsForNewChat([currentUserId]);
      setNewChatName('');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося створити чат');
    } finally {
      setIsCreatingChat(false);
    }
  }, [
    allUsers,
    bumpChatActivity,
    currentUserId,
    directChatByUserId,
    hydrateDirectChatPartners,
    newChatName,
    selectedUserIdsForNewChat,
  ]);

  const startRenameChat = useCallback(() => {
    if (!activeChat) return;
    const directUser = userByChatId[activeChat.id];
    const defaultName = activeChat.name ?? directUser?.nickname ?? `Чат #${activeChat.id.slice(0, 8)}`;
    setRenameChatName(defaultName);
    setIsRenamingChat(true);
  }, [activeChat, userByChatId]);

  const cancelRenameChat = useCallback(() => {
    setIsRenamingChat(false);
    setRenameChatName('');
  }, []);

  const saveChatRename = useCallback(async () => {
    if (!activeChatId) return;
    const trimmedName = renameChatName.trim();
    setIsSavingChatRename(true);
    try {
      const { data } = await api.updateChat(activeChatId, { name: trimmedName });
      const updatedChat = normalizeChat(data);
      setChats(prev =>
        prev.map(chat => {
          if (chat.id !== activeChatId) return chat;
          return {
            ...chat,
            name: updatedChat?.name ?? trimmedName,
            updatedAt: updatedChat?.updatedAt ?? chat.updatedAt,
          };
        }),
      );
      setIsRenamingChat(false);
      toast.success('Назву чату оновлено');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося перейменувати чат');
    } finally {
      setIsSavingChatRename(false);
    }
  }, [activeChatId, renameChatName]);

  const removeChatFromState = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    setActiveChatId(prev => (prev === chatId ? null : prev));
    setMessages(prev => (activeChatIdRef.current === chatId ? [] : prev));
    setChatActivityById(prev => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
  }, []);

  const handleLeaveChat = useCallback(async () => {
    if (!activeChatId) return;

    setIsLeavingChat(true);
    try {
      await api.leaveChat(activeChatId);
      removeChatFromState(activeChatId);
      setIsConfirmLeaveOpen(false);
      toast.success('Ви вийшли з чату');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося вийти з чату');
    } finally {
      setIsLeavingChat(false);
    }
  }, [activeChatId, removeChatFromState]);

  const handleDeleteChat = useCallback(async () => {
    if (!activeChatId) return;

    setIsDeletingChat(true);
    try {
      await api.deleteChat(activeChatId);
      removeChatFromState(activeChatId);
      setIsConfirmDeleteOpen(false);
      toast.success('Чат видалено');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося видалити чат');
    } finally {
      setIsDeletingChat(false);
    }
  }, [activeChatId, removeChatFromState]);

  const loadActiveChatParticipants = useCallback(async (chatId: string) => {
    try {
      const { data } = await api.findChatById(chatId);
      const record = normalizeRecord(data);
      const participantIds = getArrayPayload(record.users)
        .map(item => {
          const membership = normalizeRecord(item);
          if (membership.leftAt != null) return null;

          const nestedUser = normalizeRecord(membership.user);
          if (typeof nestedUser.id === 'string') return nestedUser.id;
          if (typeof membership.userId === 'string') return membership.userId;

          return null;
        })
        .filter((id): id is string => Boolean(id));

      setActiveChatParticipantIds(participantIds);
    } catch (error) {
      console.error(error);
      setActiveChatParticipantIds([]);
    }
  }, []);

  const addSelectedMembers = useCallback(async () => {
    if (!activeChatId || selectedMemberIds.length === 0) return;

    setIsAddingMembers(true);
    try {
      await api.addChatMembers(activeChatId, { userIds: selectedMemberIds });
      await loadActiveChatParticipants(activeChatId);
      setSelectedMemberIds([]);
      setAddMembersSearch('');
      setIsAddMembersDialogOpen(false);
      toast.success('Учасників додано');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося додати учасників');
    } finally {
      setIsAddingMembers(false);
    }
  }, [activeChatId, loadActiveChatParticipants, selectedMemberIds]);

  useEffect(() => {
    const loadChats = async () => {
      setIsChatsLoading(true);
      try {
        const { data } = await api.findChats();
        const rawChats = getArrayPayload(data);
        const nextActivityById: Record<string, string> = {};
        const normalizedChats = rawChats
          .map(item => {
            const chat = normalizeChat(item);
            if (!chat) return null;

            const record = normalizeRecord(item);
            const lastMessage = getArrayPayload(record.messages)?.[0];
            const lastMessageRecord = normalizeRecord(lastMessage);
            const activityAt =
              (typeof lastMessageRecord.createdAt === 'string' ? lastMessageRecord.createdAt : undefined) ??
              chat.updatedAt ??
              chat.createdAt;

            if (activityAt) {
              nextActivityById[chat.id] = activityAt;
            }
            return chat;
          })
          .filter((chat): chat is Chat => Boolean(chat));

        setChatActivityById(nextActivityById);
        const sortedChats = [...normalizedChats].sort(
          (a, b) =>
            dayjs(nextActivityById[b.id] ?? b.updatedAt ?? b.createdAt).valueOf() -
            dayjs(nextActivityById[a.id] ?? a.updatedAt ?? a.createdAt).valueOf(),
        );

        setChats(sortedChats);
        if (!activeChatId && sortedChats.length > 0) {
          setActiveChatId(sortedChats[0].id);
        }
        await hydrateDirectChatPartners(sortedChats);
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити чати');
      } finally {
        setIsChatsLoading(false);
      }
    };

    loadChats();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setEditingMessageId(null);
      return;
    }

    loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    if (!activeChatId || activeChat?.type !== ChatType.GROUP) {
      setActiveChatParticipantIds([]);
      return;
    }

    void loadActiveChatParticipants(activeChatId);
  }, [activeChat?.type, activeChatId, loadActiveChatParticipants]);

  useEffect(() => {
    if (!initialUserId) {
      handledInitialUserIdRef.current = null;
      return;
    }
    if (handledInitialUserIdRef.current === initialUserId) return;

    handledInitialUserIdRef.current = initialUserId;

    const openDirectChat = async () => {
      try {
        const target = allUsers.find(user => user.id === initialUserId);
        if (target) {
          await addOrActivateDirectChat(target, false);
        } else {
          const { data } = await api.getUserByIdOrNickname(initialUserId);
          await addOrActivateDirectChat(data, false);
        }
      } catch (error) {
        console.error(error);
        handledInitialUserIdRef.current = null;
        toast.error('Не вдалося відкрити чат');
      } finally {
        onInitialUserHandled?.();
      }
    };

    void openDirectChat();
  }, [addOrActivateDirectChat, allUsers, initialUserId, onInitialUserHandled]);

  const activeChatUser = activeChatId ? userByChatId[activeChatId] : undefined;
  const selectedOtherUsersForNewChat = useMemo(
    () => allUsers.filter(user => user.id !== currentUserId && selectedUserIdsForNewChat.includes(user.id)),
    [allUsers, currentUserId, selectedUserIdsForNewChat],
  );

  const currentUser = useMemo(() => allUsers.find(user => user.id === currentUserId), [allUsers, currentUserId]);
  const filteredUsersForNewChat = useMemo(() => {
    const query = newChatUserSearch.trim().toLowerCase();
    return allUsers
      .filter(user => user.id !== currentUserId)
      .filter(user => {
        if (!query) return true;
        return user.nickname.toLowerCase().includes(query);
      });
  }, [allUsers, currentUserId, newChatUserSearch]);

  const filteredUsersForAddMembers = useMemo(() => {
    const query = addMembersSearch.trim().toLowerCase();
    const activeIds = new Set(activeChatParticipantIds);

    return allUsers
      .filter(user => user.id !== currentUserId)
      .filter(user => !activeIds.has(user.id))
      .filter(user => {
        if (!query) return true;
        return user.nickname.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      });
  }, [activeChatParticipantIds, addMembersSearch, allUsers, currentUserId]);

  const resolveChatTitle = (chat: Chat) => {
    if (chat.name) return chat.name;
    const directUser = userByChatId[chat.id];
    if (directUser) return directUser.nickname;
    return `Чат #${chat.id.slice(0, 8)}`;
  };

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    const apiBaseUrl = env.apiUrl?.replace(/\/api\/?$/, '');
    if (!apiBaseUrl || !session.isAuthorized) {
      return;
    }

    const socket =
      socketRef.current ??
      io(`${apiBaseUrl}/chat`, {
        withCredentials: true,
        transports: ['websocket'],
      });

    socketRef.current = socket;

    const handleNewMessage = (payload: unknown) => {
      const chatId = activeChatIdRef.current;
      if (!chatId) return;

      const normalized = normalizeChatMessage(payload, chatId);
      if (!normalized) return;
      if (normalized.chatId !== chatId) return;

      setMessages(prev => {
        if (prev.some(message => message.id === normalized.id)) {
          return prev;
        }
        return [...prev, normalized];
      });
      bumpChatActivity(normalized.chatId, normalized.createdAt ?? normalized.updatedAt);
    };

    const handleChatUpdated = (payload: unknown) => {
      const updatedChat = normalizeChat(payload);
      if (!updatedChat) return;

      setChats(prev =>
        prev.map(chat =>
          chat.id === updatedChat.id
            ? {
                ...chat,
                name: updatedChat.name,
                updatedAt: updatedChat.updatedAt ?? chat.updatedAt,
              }
            : chat,
        ),
      );
    };

    const handleMessageUpdated = (payload: unknown) => {
      const chatId = activeChatIdRef.current;
      if (!chatId) return;

      const normalized = normalizeChatMessage(payload, chatId);
      if (!normalized || normalized.chatId !== chatId) return;

      setMessages(prev => prev.map(message => (message.id === normalized.id ? normalized : message)));
      setEditingMessageId(current => (current === normalized.id ? null : current));
    };

    const handleMessageDeleted = (payload: unknown) => {
      const chatId = activeChatIdRef.current;
      if (!chatId) return;

      const record = normalizeRecord(payload);
      const messageId = typeof record.id === 'string' ? record.id : null;
      const payloadChatId = typeof record.chatId === 'string' ? record.chatId : chatId;

      if (!messageId || payloadChatId !== chatId) return;

      setMessages(prev => prev.filter(message => message.id !== messageId));
      setEditingMessageId(current => (current === messageId ? null : current));
    };

    const handleChatDeleted = (payload: unknown) => {
      const record = normalizeRecord(payload);
      const chatId = typeof record.chatId === 'string' ? record.chatId : null;
      if (!chatId) return;

      removeChatFromState(chatId);
      toast('Чат було видалено', { icon: 'ℹ️' });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('chat_updated', handleChatUpdated);
    socket.on('chat_deleted', handleChatDeleted);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('chat_deleted', handleChatDeleted);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bumpChatActivity, removeChatFromState, session.isAuthorized]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!activeChatId || !socket) {
      return;
    }

    const joinChat = () => {
      socket.emit('join_chat', { chatId: activeChatId });
    };

    joinChat();
    socket.on('connect', joinChat);

    return () => {
      socket.off('connect', joinChat);
    };
  }, [activeChatId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'instant',
    });
  }, [activeChatId, messages]);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Чат</div>
      <div className="grid h-[calc(100vh-220px)] max-h-[calc(100vh-220px)] min-h-[420px] grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/40">
          <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Діалоги
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
            <Button
              className="mb-2 w-full justify-start gap-2"
              disabled={isUsersLoading || isCreatingChat || !currentUserId}
              onClick={() => {
                if (!currentUserId) {
                  toast.error('Не вдалося визначити поточного користувача');
                  return;
                }
                setSelectedUserIdsForNewChat([currentUserId]);
                setNewChatUserSearch('');
                setNewChatName('');
                setIsCreateChatDialogOpen(true);
              }}>
              <PlusIcon className="size-4" />
              Створити чат
            </Button>
            {isChatsLoading || isUsersLoading ? (
              <div className="flex items-center justify-center py-8 text-zinc-500">
                <LoaderIcon className="size-4 animate-spin" />
              </div>
            ) : (
              <>
                <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Існуючі чати
                </div>
                {chats.length === 0 ? (
                  <div className="mb-2 px-2 py-2 text-xs text-zinc-500">У вас поки немає чатів</div>
                ) : (
                  chats.map(chat => (
                    <Button
                      key={chat.id}
                      variant={chat.id === activeChatId ? 'default' : 'ghost'}
                      className="mb-1 h-auto justify-start px-2 py-2 text-left"
                      onClick={() => setActiveChatId(chat.id)}>
                      <div className="flex min-w-0 items-center gap-2">
                        <MessageCircleIcon className="size-4 shrink-0" />
                        <span className="truncate text-xs">{resolveChatTitle(chat)}</span>
                      </div>
                    </Button>
                  ))
                )}
              </>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/40">
          <div className="border-b border-white/10 px-3 py-2">
            {activeChat ? (
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  {isRenamingChat ? (
                    <Input
                      value={renameChatName}
                      onChange={event => setRenameChatName(event.target.value)}
                      placeholder="Назва чату"
                      className="h-8"
                      disabled={isSavingChatRename}
                    />
                  ) : (
                    <div className="truncate text-sm font-semibold text-white">{resolveChatTitle(activeChat)}</div>
                  )}
                </div>
                {isRenamingChat ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={saveChatRename}
                      disabled={isSavingChatRename}>
                      {isSavingChatRename ? (
                        <LoaderIcon className="size-4 animate-spin" />
                      ) : (
                        <CheckIcon className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={cancelRenameChat}
                      disabled={isSavingChatRename}>
                      <XIcon className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    {activeChat.type === ChatType.GROUP && isActiveChatCreator && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="Додати учасників"
                        onClick={() => {
                          setSelectedMemberIds([]);
                          setAddMembersSearch('');
                          setIsAddMembersDialogOpen(true);
                        }}>
                        <UserPlusIcon className="size-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="size-8" onClick={startRenameChat}>
                      <PencilIcon className="size-4" />
                    </Button>
                    {isActiveChatCreator ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        title="Видалити чат"
                        onClick={() => setIsConfirmDeleteOpen(true)}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
                        title="Вийти з чату"
                        onClick={() => setIsConfirmLeaveOpen(true)}>
                        <LogOutIcon className="size-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-sm font-semibold text-white">Оберіть чат</div>
            )}
          </div>

          <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-y-auto p-3">
            {!activeChat ? (
              <div className="py-8 text-center text-sm text-zinc-500">Оберіть діалог зліва</div>
            ) : isMessagesLoading ? (
              <div className="flex items-center justify-center py-8 text-zinc-500">
                <LoaderIcon className="size-4 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-500">Повідомлень поки немає</div>
            ) : (
              <ul className="flex flex-col gap-2">
                {messages.map(message => {
                  const isOwnMessage = Boolean(currentUserId && message.userId === currentUserId);
                  const isEditing = editingMessageId === message.id;

                  return (
                    <li key={message.id} className={cn('flex w-full', isOwnMessage ? 'justify-end' : 'justify-start')}>
                      <article
                        className={cn(
                          'group relative flex w-[75%] gap-3 rounded-lg px-3 py-2',
                          isOwnMessage ? 'bg-primary/20' : 'bg-white/4',
                        )}>
                        {!isEditing && (
                          <Avatar
                            toProfileId={message.user?.id}
                            src={message.user?.avatar?.url ?? undefined}
                            alt={message.user?.nickname ?? ''}
                            size="sm"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          {!isEditing && (
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-100">
                                {message.user ? (
                                  <UserNicknameText user={message.user} link />
                                ) : activeChatUser ? (
                                  <UserNicknameText user={activeChatUser} link />
                                ) : (
                                  'Користувач'
                                )}
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                {dayjs(message.createdAt ?? message.updatedAt).isValid()
                                  ? dayjs(message.createdAt ?? message.updatedAt).fromNow()
                                  : ''}
                              </span>
                              {message.editedAt && <span className="text-[11px] text-zinc-500">(ред.)</span>}
                            </div>
                          )}
                          {isEditing ? (
                            <MessageComposer
                              editingKey={message.id}
                              initialState={message.message}
                              existingAttachments={message.attachments}
                              submitLabel="Зберегти"
                              clearOnSubmit={false}
                              disabled={composerDisabled}
                              maxCharacters={250}
                              showCancel
                              onCancel={() => setEditingMessageId(null)}
                              onSubmit={payload => handleUpdateMessage(message, payload)}
                            />
                          ) : (
                            <>
                              <MessageContent message={message.message} />
                              <MessageAttachments attachments={message.attachments} />
                            </>
                          )}
                        </div>
                        {isOwnMessage && !isEditing && !isCommunicationMuted && (
                          <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0"
                              onClick={() => setEditingMessageId(message.id)}
                              aria-label="Редагувати повідомлення"
                              title="Редагувати повідомлення">
                              <PencilIcon className="size-4 text-zinc-300" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0"
                              disabled={isSending || isDeletingMessage}
                              onClick={() => setMessageToDelete(message)}
                              aria-label="Видалити повідомлення"
                              title="Видалити повідомлення">
                              <Trash2Icon className="size-4 text-red-400" />
                            </Button>
                          </div>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {activeChat && (
            <div className="border-t border-white/10 p-2">
              {isCommunicationMuted && (
                <div className="mb-2 text-xs text-amber-300">
                  Вам заборонено писати повідомлення на час блокування
                  {session.user.user?.bannedUntil
                    ? ` до ${dayjs(session.user.user.bannedUntil).format('DD.MM.YYYY HH:mm')}`
                    : ''}
                  .
                </div>
              )}
              <MessageComposer
                placeholder="Напишіть повідомлення..."
                maxCharacters={250}
                disabled={composerDisabled}
                onSubmit={async ({ lexicalState, attachments }) => {
                  setIsSending(true);
                  try {
                    if (attachments.length > 0) {
                      await api.sendChatMessage(activeChat.id, {
                        content: lexicalState,
                        attachments,
                      });
                      await loadMessages(activeChat.id);
                      return;
                    }

                    const socket = socketRef.current;
                    if (socket?.connected) {
                      socket.emit('send_message', {
                        chatId: activeChat.id,
                        content: lexicalState,
                      });
                    } else {
                      await api.sendChatMessage(activeChat.id, { content: lexicalState });
                      await loadMessages(activeChat.id);
                    }
                  } catch (error) {
                    console.error(error);
                    toast.error('Не вдалося відправити повідомлення');
                  } finally {
                    setIsSending(false);
                  }
                }}
              />
            </div>
          )}
        </section>
      </div>

      <Dialog open={isCreateChatDialogOpen} onOpenChange={setIsCreateChatDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Створити чат</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={newChatName}
              onChange={event => setNewChatName(event.target.value)}
              placeholder="Назва чату"
              label="Назва чату"
              disabled={isCreatingChat}
            />
            <div className="rounded-md border border-white/10 bg-black/30 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Учасники (ви додані за замовчуванням)
              </div>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm text-zinc-200">
                  <UsersIcon className="size-4 text-zinc-400" />
                  {currentUser?.nickname ?? 'Ви'}
                </li>
                {selectedOtherUsersForNewChat.map(user => (
                  <li key={user.id} className="flex items-center gap-2 text-sm text-zinc-200">
                    <UsersIcon className="size-4 text-zinc-400" />
                    {user.nickname}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Список користувачів
              </div>
              <input
                value={newChatUserSearch}
                onChange={event => setNewChatUserSearch(event.target.value)}
                placeholder="Пошук користувача..."
                className="mb-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-primary/60"
              />
              <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                {filteredUsersForNewChat.length === 0 ? (
                  <div className="px-2 py-2 text-xs text-zinc-500">Користувачів не знайдено</div>
                ) : (
                  filteredUsersForNewChat.map(user => {
                    const isSelected = selectedUserIdsForNewChat.includes(user.id);
                    return (
                      <Button
                        key={user.id}
                        variant={isSelected ? 'default' : 'ghost'}
                        className="h-auto w-full justify-start px-2 py-2 text-left"
                        onClick={() => toggleUserInSelection(user.id)}>
                        <div className="flex min-w-0 items-center gap-2">
                          <UsersIcon className="size-4 shrink-0" />
                          <span className="truncate text-xs">{user.nickname}</span>
                        </div>
                      </Button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateChatDialogOpen(false)} disabled={isCreatingChat}>
              Скасувати
            </Button>
            <Button onClick={createSelectedChat} disabled={isCreatingChat}>
              {isCreatingChat ? 'Створення...' : 'Створити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(messageToDelete)}
        onOpenChange={open => {
          if (!open && !isDeletingMessage) {
            setMessageToDelete(null);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити повідомлення?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Ця дія незворотна. Повідомлення буде видалено для всіх учасників чату.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageToDelete(null)} disabled={isDeletingMessage}>
              Скасувати
            </Button>
            <Button className="bg-red-600 hover:bg-red-500" onClick={confirmDeleteMessage} disabled={isDeletingMessage}>
              {isDeletingMessage ? <LoaderIcon className="size-4 animate-spin" /> : 'Видалити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmLeaveOpen} onOpenChange={setIsConfirmLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вийти з чату?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">Ви більше не бачитимете цей чат. Творець чату зможе додати вас знову.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmLeaveOpen(false)} disabled={isLeavingChat}>
              Скасувати
            </Button>
            <Button onClick={handleLeaveChat} disabled={isLeavingChat}>
              {isLeavingChat ? <LoaderIcon className="size-4 animate-spin" /> : 'Вийти'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити чат?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Чат і всі повідомлення будуть видалені для всіх учасників. Цю дію не можна скасувати.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)} disabled={isDeletingChat}>
              Скасувати
            </Button>
            <Button className="bg-red-600 hover:bg-red-500" onClick={handleDeleteChat} disabled={isDeletingChat}>
              {isDeletingChat ? <LoaderIcon className="size-4 animate-spin" /> : 'Видалити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMembersDialogOpen} onOpenChange={setIsAddMembersDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Додати учасників</DialogTitle>
          </DialogHeader>

          <input
            value={addMembersSearch}
            onChange={event => setAddMembersSearch(event.target.value)}
            placeholder="Пошук користувача..."
            className="mb-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-primary/60"
          />

          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {filteredUsersForAddMembers.length === 0 ? (
              <div className="px-2 py-2 text-xs text-zinc-500">Користувачів не знайдено</div>
            ) : (
              filteredUsersForAddMembers.map(user => {
                const isSelected = selectedMemberIds.includes(user.id);
                return (
                  <Button
                    key={user.id}
                    variant={isSelected ? 'default' : 'ghost'}
                    className="h-auto w-full justify-start px-2 py-2 text-left"
                    onClick={() => {
                      setSelectedMemberIds(prev =>
                        prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id],
                      );
                    }}>
                    <div className="flex min-w-0 items-center gap-2">
                      <UsersIcon className="size-4 shrink-0" />
                      <span className="truncate text-xs">{user.nickname}</span>
                    </div>
                  </Button>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMembersDialogOpen(false)} disabled={isAddingMembers}>
              Скасувати
            </Button>
            <Button onClick={addSelectedMembers} disabled={isAddingMembers || selectedMemberIds.length === 0}>
              {isAddingMembers ? <LoaderIcon className="size-4 animate-spin" /> : 'Додати'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
