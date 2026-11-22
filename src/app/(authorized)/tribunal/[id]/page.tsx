'use client';

import { session } from '@/entities/session/session.state';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { MessageAttachments } from '@/entities/attachment/ui/message-attachments';
import { MessageContent } from '@/entities/comment/lexical-message';
import { MessageComposer } from '@/features/chat/message-composer/message-composer';
import { tribunalApi } from '@/shared/sdk';
import { TribunalComplaintDetails, TribunalMessage } from '@/shared/sdk/tribunal/tribunal.schemas';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/organisms/dialog';
import { Avatar } from '@/shared/ui/organisms/avatar';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/organisms/drawer';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/utils/cn';
import { Layout } from '@/widgets/layout';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uk';
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('uk');
import { observer } from 'mobx-react-lite';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const punishmentLabel = {
  NONE: 'Без покарання',
  WARNING: 'Попередження',
  TEMP_BAN: 'Тимчасовий бан',
  PERMANENT_BAN: 'Перманентний бан',
} as const;

const statusLabel = {
  OPEN: 'Нова',
  IN_PROGRESS: 'В роботі',
  PUNISHED: 'Закрита · покарання',
  REJECTED: 'Закрита · відхилено',
} as const;

const badgeClass = {
  OPEN: 'bg-amber-400/15 text-amber-100',
  IN_PROGRESS: 'bg-sky-400/15 text-sky-100',
  PUNISHED: 'bg-lime-400/10 text-lime-200',
  REJECTED: 'bg-white/10 text-zinc-300',
} as const;

const fieldClass =
  'flex h-9 w-full rounded-md border border-neutral-700 bg-black/70 px-2 text-sm text-zinc-100 focus-visible:border-lime-500 focus-visible:outline-none';

const errorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;

  if (Array.isArray(message)) return message[0] ?? 'Не вдалося виконати дію';
  if (typeof message === 'string') return message;

  return 'Не вдалося виконати дію';
};

const TribunalComplaintPage = observer(() => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [complaint, setComplaint] = useState<TribunalComplaintDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<TribunalMessage | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [outcome, setOutcome] = useState<'PUNISHED' | 'REJECTED' | ''>('');
  const [punishmentType, setPunishmentType] = useState('');
  const [warningCount, setWarningCount] = useState('1');
  const [warningComment, setWarningComment] = useState('');
  const [ruleNumberDraft, setRuleNumberDraft] = useState('');
  const [ruleTextDraft, setRuleTextDraft] = useState('');
  const [bannedUntil, setBannedUntil] = useState('');
  const [mute, setMute] = useState(false);
  const [resolutionComment, setResolutionComment] = useState('');
  const [admins, setAdmins] = useState<{ id: string; nickname: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    tribunalApi
      .findComplaint(id)
      .then(({ data }) => setComplaint(data))
      .catch(() => {
        toast.error('Не вдалося відкрити скаргу');
        setComplaint(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!session.canModerateUsers) return;

    tribunalApi
      .findAdmins()
      .then(({ data }) => setAdmins(data))
      .catch(() => setAdmins([]));
  }, [session.canModerateUsers]);

  useEffect(() => {
    setRuleNumberDraft(complaint?.ruleNumber ?? '');
    setRuleTextDraft(complaint?.ruleText ?? '');
  }, [complaint?.id, complaint?.ruleNumber, complaint?.ruleText]);

  const currentUserId = session.user?.data?.id;
  const canWrite =
    !!complaint &&
    !!currentUserId &&
    (complaint.status === 'OPEN' || complaint.status === 'IN_PROGRESS') &&
    (session.canModerateUsers ||
      complaint.authorId === currentUserId ||
      complaint.targetUserId === currentUserId);

  const uploadFiles = async (fileList: FileList | null) => {
    if (!id || !fileList?.length) return;

    try {
      setUploading(true);
      const { data } = await tribunalApi.uploadAttachments(id, Array.from(fileList).slice(0, 10));
      setComplaint(data);
      toast.success('Файли додано');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const assignTo = async (nextAssigneeId: string) => {
    if (!id || !nextAssigneeId || nextAssigneeId === complaint?.assigneeId) return;

    try {
      setAssigning(true);
      const { data } = await tribunalApi.assignComplaint(id, nextAssigneeId);
      setComplaint(data);
      toast.success('Скаргу призначено');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAssigning(false);
    }
  };

  const resolveComplaint = async (event: FormEvent) => {
    event.preventDefault();
    if (!id || !outcome) return;

    if (outcome === 'PUNISHED' && (!ruleNumberDraft.trim() || !ruleTextDraft.trim())) {
      toast.error('Вкажіть номер і текст порушеного правила');
      return;
    }

    const warningAmount = Number(warningCount);

    if (
      outcome === 'PUNISHED' &&
      punishmentType === 'WARNING' &&
      (!Number.isInteger(warningAmount) || warningAmount < 1 || warningAmount > 10)
    ) {
      toast.error('Кількість попереджень має бути від 1 до 10');
      return;
    }

    if (outcome === 'PUNISHED' && !punishmentType) {
      toast.error('Оберіть покарання');
      return;
    }

    if (outcome === 'PUNISHED' && punishmentType === 'TEMP_BAN' && !bannedUntil) {
      toast.error('Вкажіть термін бану');
      return;
    }

    try {
      setResolving(true);

      const { data } = await tribunalApi.resolveComplaint(id, {
        outcome,
        ...(outcome === 'PUNISHED'
          ? {
              ruleNumber: ruleNumberDraft.trim(),
              ruleText: ruleTextDraft.trim(),
              punishment: {
                type: punishmentType as 'WARNING' | 'TEMP_BAN' | 'PERMANENT_BAN',
                reason: ruleTextDraft.trim(),
                ...(punishmentType === 'WARNING'
                  ? {
                      warningCount: Number(warningCount),
                      ...(warningComment.trim() ? { comment: warningComment.trim() } : {}),
                    }
                  : {}),
                ...(punishmentType === 'TEMP_BAN'
                  ? { bannedUntil: new Date(bannedUntil).toISOString(), mute }
                  : {}),
              },
            }
          : {}),
        ...(resolutionComment.trim() ? { comment: resolutionComment.trim() } : {}),
      });
      setComplaint(data);
      setOutcome('');
      setDecisionOpen(false);
      toast.success(outcome === 'REJECTED' ? 'Скаргу відхилено' : 'Скаргу розглянуто');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setResolving(false);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!id || !messageToDelete || isDeletingMessage) return;

    try {
      setIsDeletingMessage(true);
      await tribunalApi.deleteMessage(id, messageToDelete.id);
      setComplaint(current =>
        current
          ? { ...current, messages: current.messages.filter(message => message.id !== messageToDelete.id) }
          : current,
      );
      setMessageToDelete(null);
      toast.success('Повідомлення видалено');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsDeletingMessage(false);
    }
  };

  const canModerateOpenComplaint =
    !!complaint &&
    session.canModerateUsers &&
    (complaint.status === 'OPEN' || complaint.status === 'IN_PROGRESS');

  return (
    <Layout>
      <div className="container mx-auto my-6 w-full max-w-3xl px-4">
        <Button variant="ghost" size="sm" className="self-start" onClick={() => router.push(ROUTES.tribunal)}>
          <ArrowLeftIcon className="size-4" />
          До списку
        </Button>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <LoaderIcon className="size-4 animate-spin" />
            Завантаження…
          </div>
        ) : !complaint ? (
          <div className="text-sm text-zinc-400">Скаргу не знайдено</div>
        ) : (
          <>
            <section className="paper flex flex-col gap-5 rounded-xl border px-5 py-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold text-white">Скарга №{complaint.number}</h1>
                <span className={cn('rounded px-2 py-0.5 text-xs', badgeClass[complaint.status])}>
                  {statusLabel[complaint.status]}
                </span>
              </div>
              <div className="text-sm text-zinc-300">
                Подав <UserNicknameText user={complaint.author} /> на <UserNicknameText user={complaint.target} />
              </div>
              {canModerateOpenComplaint ? (
                <label className="flex max-w-xs flex-col gap-1 text-xs text-zinc-400">
                  Закріплений адмін
                  <select
                    className={fieldClass}
                    value={complaint.assigneeId ?? ''}
                    disabled={assigning}
                    onChange={event => assignTo(event.target.value)}>
                    {!complaint.assigneeId && <option value="">Не призначено</option>}
                    {complaint.assignee &&
                      !admins.some(admin => admin.id === complaint.assigneeId) && (
                        <option value={complaint.assignee.id}>{complaint.assignee.nickname}</option>
                      )}
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.nickname}
                        {admin.id === currentUserId ? ' (ви)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="text-sm text-zinc-300">
                  Закріплений адмін:{' '}
                  {complaint.assignee ? <UserNicknameText user={complaint.assignee} /> : 'не призначено'}
                </div>
              )}
              <div className="text-sm text-zinc-300">
                Правило:{' '}
                <span className="text-zinc-100">
                  {complaint.ruleNumber ? `${complaint.ruleNumber}. ${complaint.ruleText ?? ''}` : 'не визначено'}
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                Дата порушення: {dayjs(complaint.violatedAt).format('DD.MM.YYYY HH:mm')}
              </div>
              <div className="text-sm text-zinc-400">
                Гра: {complaint.game ? `${complaint.game.mission.name} · ${dayjs(complaint.game.date).format('DD.MM.YYYY HH:mm')}` : 'не вказана'}
              </div>
              <div className="text-sm text-zinc-400">
                Покарання: {punishmentLabel[complaint.punishmentKind]}
                {complaint.punishmentKind === 'WARNING' && complaint.warningWeight
                  ? ` · ${complaint.warningWeight}`
                  : ''}
                {complaint.bannedUntil ? ` до ${dayjs(complaint.bannedUntil).format('DD.MM.YYYY HH:mm')}` : ''}
              </div>
              {complaint.resolvedBy && (
                <div className="text-sm text-zinc-300">
                  Розглянув <UserNicknameText user={complaint.resolvedBy} />
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm text-zinc-200">{complaint.description}</p>
              <MessageAttachments attachments={complaint.attachments} />
              {(complaint.authorId === currentUserId ||
                complaint.targetUserId === currentUserId ||
                session.canModerateUsers) &&
                (complaint.status === 'OPEN' || complaint.status === 'IN_PROGRESS') && (
                  <label className="flex flex-col gap-1 text-xs text-zinc-400">
                    Додати фото або відео
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      disabled={uploading}
                      className="text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-zinc-100"
                      onChange={event => {
                        void uploadFiles(event.target.files);
                        event.target.value = '';
                      }}
                    />
                  </label>
                )}

              {canModerateOpenComplaint && (
                <Button type="button" className="self-start" onClick={() => setDecisionOpen(true)}>
                  Прийняти рішення
                </Button>
              )}

              <div className="border-t border-white/10 pt-2">
                <h2 className="text-2xl font-bold text-white">Коментарі</h2>
                {complaint.messages.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-500">Повідомлень поки немає</div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {complaint.messages.map(message => {
                      const isOwnMessage = Boolean(currentUserId && message.authorId === currentUserId);

                      return (
                        <li key={message.id} className={cn('flex w-full', isOwnMessage ? 'justify-end' : 'justify-start')}>
                          <article
                            className={cn(
                              'group relative flex w-[75%] gap-3 rounded-lg px-3 py-2',
                              isOwnMessage ? 'bg-primary/20' : 'bg-white/4',
                            )}>
                            <Avatar
                              toProfileId={message.author.id}
                              src={message.author.avatar?.url ?? undefined}
                              alt={message.author.nickname}
                              size="sm"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-zinc-100">
                                  <UserNicknameText user={message.author} />
                                </span>
                                <time
                                  className="text-[11px] text-zinc-500"
                                  title={dayjs(message.createdAt).format('DD.MM.YYYY HH:mm')}>
                                  {dayjs(message.createdAt).fromNow()}
                                </time>
                              </div>
                              <MessageContent message={message.body} />
                            </div>
                            {session.canModerateUsers && (
                              <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 p-0"
                                  disabled={isDeletingMessage}
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

                {canWrite && (
                  <div className="border-t border-white/10 pt-2">
                    {session.isCommunicationMuted && (
                      <div className="mb-2 text-xs text-amber-300">
                        Вам заборонено писати повідомлення на час блокування
                        {session.user?.data?.bannedUntil
                          ? ` до ${dayjs(session.user.data.bannedUntil).format('DD.MM.YYYY HH:mm')}`
                          : ''}
                        .
                      </div>
                    )}
                    <MessageComposer
                      allowAttachments={false}
                      disabled={sending || session.isCommunicationMuted}
                      onSubmit={async ({ text, lexicalState }) => {
                        if (!id || !text.trim()) return;

                        try {
                          setSending(true);
                          const { data } = await tribunalApi.createMessage(id, JSON.stringify(lexicalState));
                          setComplaint(current =>
                            current ? { ...current, messages: [...current.messages, data] } : current,
                          );
                        } catch (error) {
                          toast.error(errorMessage(error));
                          throw error;
                        } finally {
                          setSending(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            <Drawer open={decisionOpen} onOpenChange={setDecisionOpen}>
              <DrawerContent>
                <form onSubmit={resolveComplaint} className="flex min-h-0 flex-1 flex-col gap-4">
                  <DrawerHeader>
                    <DrawerTitle>Прийняти рішення</DrawerTitle>
                  </DrawerHeader>
                  <DrawerBody className="flex flex-col gap-3">
                    <select
                      className={fieldClass}
                      value={outcome}
                      onChange={event => setOutcome(event.target.value as 'PUNISHED' | 'REJECTED' | '')}>
                      <option value="">Оберіть рішення</option>
                      <option value="PUNISHED">Призначити покарання</option>
                      <option value="REJECTED">Відхилити скаргу</option>
                    </select>
                    {outcome === 'PUNISHED' && (
                      <>
                        <Input
                          label="№ правила"
                          value={ruleNumberDraft}
                          onChange={event => setRuleNumberDraft(event.target.value)}
                          maxLength={20}
                        />
                        <Textarea
                          label="Текст правила"
                          value={ruleTextDraft}
                          onChange={event => setRuleTextDraft(event.target.value)}
                          maxLength={1000}
                        />
                        <select
                          className={fieldClass}
                          value={punishmentType}
                          onChange={event => setPunishmentType(event.target.value)}>
                          <option value="">Тип покарання</option>
                          <option value="WARNING">Попередження</option>
                          <option value="TEMP_BAN">Тимчасовий бан</option>
                          {session.canPermanentlyBanUsers && <option value="PERMANENT_BAN">Перманентний бан</option>}
                        </select>
                        {punishmentType === 'WARNING' && (
                          <>
                            <Input
                              label="Кількість попереджень"
                              type="number"
                              min={1}
                              max={10}
                              value={warningCount}
                              onChange={event => setWarningCount(event.target.value)}
                            />
                            <Textarea
                              label="Коментар до попередження"
                              value={warningComment}
                              onChange={event => setWarningComment(event.target.value)}
                              maxLength={1000}
                            />
                          </>
                        )}
                        {punishmentType === 'TEMP_BAN' && (
                          <>
                            <Input
                              label="Бан до"
                              type="datetime-local"
                              value={bannedUntil}
                              onChange={event => setBannedUntil(event.target.value)}
                            />
                            <label className="flex items-center gap-2 text-sm text-zinc-200">
                              <input type="checkbox" checked={mute} onChange={event => setMute(event.target.checked)} />
                              Замʼютити
                            </label>
                          </>
                        )}
                      </>
                    )}
                    {outcome && (
                      <Textarea
                        label="Коментар до рішення"
                        value={resolutionComment}
                        onChange={event => setResolutionComment(event.target.value)}
                        maxLength={2000}
                      />
                    )}
                  </DrawerBody>
                  <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
                    <Button type="button" variant="outline" disabled={resolving} onClick={() => setDecisionOpen(false)}>
                      Скасувати
                    </Button>
                    <Button type="submit" disabled={resolving || !outcome}>
                      {resolving ? <LoaderIcon className="size-4 animate-spin" /> : 'Закрити скаргу'}
                    </Button>
                  </DrawerFooter>
                </form>
              </DrawerContent>
            </Drawer>

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
                  Ця дія незворотна. Повідомлення буде видалено для всіх, хто бачить скаргу.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMessageToDelete(null)} disabled={isDeletingMessage}>
                    Скасувати
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-500"
                    onClick={confirmDeleteMessage}
                    disabled={isDeletingMessage}>
                    {isDeletingMessage ? <LoaderIcon className="size-4 animate-spin" /> : 'Видалити'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </Layout>
  );
});

export default TribunalComplaintPage;
