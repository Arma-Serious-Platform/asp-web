'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import toast from 'react-hot-toast';
import { CheckIcon, LoaderIcon, MessageCircleIcon, PencilIcon, PlusIcon, UsersIcon, XIcon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

import { api } from '@/shared/sdk';
import { Chat, ChatType, MissionCommentMessage, User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Avatar } from '@/shared/ui/organisms/avatar';
import { cn } from '@/shared/utils/cn';
import { MessageEditor } from '@/features/chat/editor';
import { MessageContent } from '@/entities/comment/lexical-message';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { session } from '@/entities/session/model';
import { env } from '@/shared/config/env';
import { getTokensFromLocalStorage } from '@/shared/utils/session';
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
  createdAt?: string;
  updatedAt?: string;
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
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
  };
};

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

  const rawMessage = extractMessagePayload(record);

  return {
    id: record.id,
    chatId: typeof record.chatId === 'string' ? record.chatId : chatId,
    userId: typeof record.userId === 'string' ? record.userId : user?.id,
    user,
    message: normalizeMessagePayload(rawMessage),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
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

export function ProfileChat({ initialUserId, onInitialUserHandled }: ProfileChatProps) {
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
  const [userByChatId, setUserByChatId] = useState<Record<string, User | undefined>>({});
  const [directChatByUserId, setDirectChatByUserId] = useState<Record<string, string>>({});
  const [chatActivityById, setChatActivityById] = useState<Record<string, string>>({});
  const handledInitialUserIdRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const activeChat = useMemo(() => chats.find(chat => chat.id === activeChatId) ?? null, [activeChatId, chats]);
  const currentUserId = session.user.user?.id;

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
        const normalized = getArrayPayload(data)
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
        const { data } = await api.createChat({
          type: ChatType.DIRECT,
          userIds: [currentUserId, targetUser.id],
        });
        const chat = normalizeChat(data);
        if (!chat) return;

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
      const { data } = await api.createChat({
        type,
        userIds: selectedUserIdsForNewChat,
        ...(trimmedName ? { name: trimmedName } : {}),
      });
      const chat = normalizeChat(data);
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
    const defaultName = directUser?.nickname ?? activeChat.name ?? `Чат #${activeChat.id.slice(0, 8)}`;
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
      return;
    }

    loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    if (!initialUserId) return;
    if (handledInitialUserIdRef.current === initialUserId) return;

    const openDirectChat = async () => {
      try {
        const target = allUsers.find(user => user.id === initialUserId);
        if (target) {
          await addOrActivateDirectChat(target, false);
        } else {
          const { data } = await api.getUserByIdOrNickname(initialUserId);
          await addOrActivateDirectChat(data, false);
        }
        handledInitialUserIdRef.current = initialUserId;
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося відкрити чат');
      } finally {
        onInitialUserHandled?.();
      }
    };

    openDirectChat();
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
        return user.nickname.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      });
  }, [allUsers, currentUserId, newChatUserSearch]);

  const resolveChatTitle = (chat: Chat) => {
    const directUser = userByChatId[chat.id];
    if (directUser) return directUser.nickname;
    if (chat.name) return chat.name;
    return `Чат #${chat.id.slice(0, 8)}`;
  };

  useEffect(() => {
    if (!activeChatId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = getTokensFromLocalStorage()?.token;
    const apiBaseUrl = env.apiUrl?.replace(/\/api\/?$/, '');
    if (!token || !apiBaseUrl) {
      return;
    }

    const socket =
      socketRef.current ??
      io(`${apiBaseUrl}/chat`, {
        auth: { token },
        transports: ['websocket'],
      });

    socketRef.current = socket;

    const handleNewMessage = (payload: unknown) => {
      const normalized = normalizeChatMessage(payload, activeChatId);
      if (!normalized) return;
      if (normalized.chatId !== activeChatId) return;

      setMessages(prev => {
        if (prev.some(message => message.id === normalized.id)) {
          return prev;
        }
        return [...prev, normalized];
      });
      bumpChatActivity(normalized.chatId, normalized.createdAt ?? normalized.updatedAt);
    };

    socket.on('new_message', handleNewMessage);
    socket.emit('join_chat', { chatId: activeChatId });

    return () => {
      socket.emit('leave_chat', { chatId: activeChatId });
      socket.off('new_message', handleNewMessage);
    };
  }, [activeChatId, bumpChatActivity]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

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
                  <Button variant="ghost" size="icon" className="size-8" onClick={startRenameChat}>
                    <PencilIcon className="size-4" />
                  </Button>
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
                  return (
                    <li key={message.id} className={cn('flex w-full', isOwnMessage ? 'justify-end' : 'justify-start')}>
                      <article
                        className={cn(
                          'flex w-[75%] gap-3 rounded-lg px-3 py-2',
                          isOwnMessage ? 'bg-primary/20' : 'bg-white/4',
                        )}>
                        <Avatar
                          toProfileId={message.user?.id}
                          src={message.user?.avatar?.url ?? undefined}
                          alt={message.user?.nickname ?? ''}
                          size="sm"
                        />
                        <div className="min-w-0">
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
                          </div>
                          <MessageContent message={message.message} />
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {activeChat && (
            <div className="border-t border-white/10 p-2">
              <MessageEditor
                placeholder="Напишіть повідомлення..."
                maxCharacters={250}
                disabled={isSending}
                onSubmit={async ({ lexicalState }) => {
                  setIsSending(true);
                  try {
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
    </div>
  );
}
