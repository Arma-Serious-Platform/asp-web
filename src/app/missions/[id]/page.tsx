'use client';

import { Layout } from '@/widgets/layout';
import { Button } from '@/shared/ui/atoms/button';
import { api } from '@/shared/sdk';
import { Mission, MissionStatus, MissionVersion, State, UserRole } from '@/shared/sdk/types';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  EllipsisIcon,
  PlusIcon,
  LoaderIcon,
  EditIcon,
  Trash2Icon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/shared/config/routes';
import { ChangeMissionVersionStatusModal } from '@/features/mission/change-mission-status/ui';
import { CreateUpdateMissionVersionModal } from '@/features/mission/create-update-version/ui';
import { UpdateMissionModal } from '@/features/mission/update-mission/ui';
import { MissionDetailsModel } from './model';
import { MissionVersionCard } from '@/entities/mission/version/version-card/ui';
import { View } from '@/features/view';
import { session } from '@/entities/session/model';
import { observer } from 'mobx-react-lite';
import { CommentList } from '@/entities/comment';
import { MessageComposer, MessageComposerSubmitPayload } from '@/features/chat/message-composer/ui';
import type { MissionComment } from '@/shared/sdk/types';
import { DeleteMissionCommentModal, DeleteMissionCommentModel } from '@/features/mission/comment/delete-comment';
import { DeleteMissionModal, DeleteMissionModel } from '@/features/mission/delete-mission';
import { ChangeMissionStateModal } from '@/features/mission/change-mission-state';
import { MissionAuthorsText } from '@/entities/mission/mission-authors-text';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { MessageContent } from '@/entities/comment/lexical-message';
import { Popover } from '@/shared/ui/moleculas/popover';
import dayjs from 'dayjs';

const MissionDetailsPage = observer(() => {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [versionToDelete, setVersionToDelete] = useState<MissionVersion | null>(null);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  const [missionActionsOpen, setMissionActionsOpen] = useState(false);
  const missionDetailsModel = useMemo(() => new MissionDetailsModel(), []);
  const deleteCommentModel = useMemo(() => new DeleteMissionCommentModel(), []);
  const deleteMissionModel = useMemo(() => new DeleteMissionModel(), []);
  const currentUserId = session.user?.user?.id;

  useEffect(() => {
    if (!session.isSessionReady) return;

    if (!session.isAuthorized) {
      router.push(ROUTES.auth.login);
    }
  }, [router, session.isAuthorized, session.isSessionReady]);

  const isMissionAuthor = useMemo(() => {
    return currentUserId === mission?.authorId;
  }, [currentUserId, mission?.authorId]);
  const isMissionCoauthor = useMemo(() => {
    return Boolean(currentUserId && mission?.coauthors?.some(coauthor => coauthor.id === currentUserId));
  }, [currentUserId, mission?.coauthors]);
  const isMissionArchived = mission?.state === State.ARCHIVED;
  const canEditMission = isMissionAuthor || isMissionCoauthor || session.canManageMissions;
  const canEditMissionVersion = canEditMission && !isMissionArchived;
  const canChangeMissionVersionStatus = session.canReviewMissions && !isMissionArchived;
  const canDeleteMissionVersion = session.canManageMissions;
  const canDeleteMission = session.canManageMissions;
  const canChangeMissionState =
    isMissionAuthor ||
    isMissionCoauthor ||
    [UserRole.OWNER, UserRole.UVK].includes(session.user?.user?.role as UserRole);
  const hasMissionActions = canEditMission || canChangeMissionState || canDeleteMission;

  useEffect(() => {
    if (!session.isSessionReady || !session.isAuthorized) return;

    const loadMission = async () => {
      try {
        setIsLoading(true);
        const response = await api.findMissionById(missionId);
        setMission(response.data);
      } catch (error) {
        console.error('Failed to load mission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (missionId) {
      loadMission();
    }
  }, [missionId, session.isAuthorized, session.isSessionReady]);

  useEffect(() => {
    if (!session.isSessionReady || !session.isAuthorized) return;

    if (missionId) {
      missionDetailsModel.commentModel.pagination.loadAll({
        missionId,
      });
    }
  }, [missionId, session.isAuthorized, session.isSessionReady, missionDetailsModel.commentModel.pagination]);

  const handleCreateVersion = () => {
    if (!mission) return;
    if (mission.state === State.ARCHIVED) {
      toast.error('Неможливо створити версію для архівованої місії');
      return;
    }

    missionDetailsModel.createUpdateMissionVersionModel.visibility.open({
      missionId,
      mission,
    });
  };

  const handleEditVersion = (version: MissionVersion) => {
    if (!mission) return;
    if (mission.state === State.ARCHIVED) {
      toast.error('Неможливо редагувати версію архівованої місії');
      return;
    }

    missionDetailsModel.createUpdateMissionVersionModel.visibility.open({
      missionId,
      mission,
      version,
    });
  };

  const handleVersionSaved = async () => {
    // Reload mission to get updated versions
    const response = await api.findMissionById(missionId);
    setMission(response.data);
  };

  const handleMissionUpdate = () => {
    if (!mission) return;
    missionDetailsModel.updateMissionModel.visibility.open({
      mission,
    });
  };

  const handleMissionSaved = async () => {
    // Reload mission
    const response = await api.findMissionById(missionId);
    setMission(response.data);
  };

  const handleDeleteMission = async (id: string) => {
    try {
      await api.deleteMission(id);
      toast.success('Місію видалено');
      router.push(ROUTES.missions.root);
    } catch {
      toast.error('Не вдалося видалити місію');
      throw new Error('Delete mission failed');
    }
  };

  const handleChangeMissionState = () => {
    if (!mission) return;

    const nextState = mission.state === State.ARCHIVED ? State.ACTIVE : State.ARCHIVED;
    missionDetailsModel.changeMissionStateModel.visibility.open({
      mission,
      state: nextState,
    });
  };

  const handleDeleteVersion = async () => {
    if (!versionToDelete) return;

    try {
      setIsDeletingVersion(true);
      await api.deleteMissionVersion(missionId, versionToDelete.id);
      toast.success('Версію місії видалено');
      setVersionToDelete(null);
      await handleVersionSaved();
    } catch {
      toast.error('Не вдалося видалити версію місії');
    } finally {
      setIsDeletingVersion(false);
    }
  };

  const canDeleteComment = (comment: MissionComment) => {
    const currentUserId = session.user?.user?.id;
    const isCommentAuthor = Boolean(
      currentUserId && (comment.userId === currentUserId || comment.user?.id === currentUserId),
    );

    return session.isHasAdminPanelAccess || isCommentAuthor;
  };

  const canEditComment = (comment: MissionComment) => {
    if (session.isCommunicationMuted) {
      return false;
    }

    const currentUserId = session.user?.user?.id;
    return Boolean(currentUserId && (comment.userId === currentUserId || comment.user?.id === currentUserId));
  };

  const handleDeleteComment = (comment: MissionComment) => {
    deleteCommentModel.visibility.open({ comment });
  };

  const handleEditComment = async (comment: MissionComment, payload: MessageComposerSubmitPayload) => {
    await missionDetailsModel.commentModel.update(comment.id, missionId, payload);
  };

  if (!session.isSessionReady || !session.isAuthorized) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout showHero={false}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <LoaderIcon className="size-6 animate-spin text-zinc-400" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!mission) {
    return (
      <Layout showHero={false}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-zinc-400 mb-4">Місію не знайдено</p>
            <Button variant="outline" onClick={() => router.push(ROUTES.missions.root)}>
              Повернутися до списку
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHero={false}>
      <ChangeMissionVersionStatusModal
        model={missionDetailsModel.changeMissionVersionStatusModel}
        onSuccess={async status => {
          // Reload mission to get updated versions
          const response = await api.findMissionById(missionId);
          setMission(response.data);
        }}
      />
      <CreateUpdateMissionVersionModal
        model={missionDetailsModel.createUpdateMissionVersionModel}
        onSuccess={handleVersionSaved}
      />
      <UpdateMissionModal model={missionDetailsModel.updateMissionModel} onSuccess={handleMissionSaved} />
      <ChangeMissionStateModal
        model={missionDetailsModel.changeMissionStateModel}
        onSuccess={state =>
          setMission(currentMission => (currentMission ? { ...currentMission, state } : currentMission))
        }
      />
      <DeleteMissionCommentModal
        model={deleteCommentModel}
        onConfirm={commentId => missionDetailsModel.commentModel.remove(missionId, commentId)}
      />
      <DeleteMissionModal model={deleteMissionModel} onConfirm={handleDeleteMission} />
      <Dialog open={Boolean(versionToDelete)} onOpenChange={open => !open && setVersionToDelete(null)}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити версію місії?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-400">
            Версія «<span className="font-medium text-zinc-200">{versionToDelete?.version}</span>» буде видалена
            назавжди. Цю дію неможливо скасувати.
          </p>

          <div className="mt-4 flex justify-between gap-2">
            <Button variant="outline" disabled={isDeletingVersion} onClick={() => setVersionToDelete(null)}>
              Скасувати
            </Button>
            <Button variant="destructive" disabled={isDeletingVersion} onClick={handleDeleteVersion}>
              {isDeletingVersion ? 'Видалення...' : 'Видалити версію'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto my-6 w-full px-4">
        <Button variant="ghost" onClick={() => router.push(ROUTES.missions.root)} className="mb-4">
          ← Повернутися до списку
        </Button>

        <div className="paper mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-xl border px-5 py-5 shadow-xl lg:px-7 lg:py-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Mission Image */}
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-white/10 md:w-80">
              {mission.image?.url ? (
                <Image
                  src={mission.image.url}
                  alt={mission?.name}
                  fill
                  className="object-cover"
                  unoptimized={!mission.image.url.startsWith('https')}
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <span className="text-zinc-500 text-sm">Немає зображення</span>
                </div>
              )}
            </div>

            {/* Mission Info */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white mb-3">
                    {mission?.name}
                  </h1>
                  {mission.state === State.ARCHIVED && (
                    <span className="mb-3 inline-flex w-fit rounded border border-zinc-500/50 bg-zinc-900 px-2 py-1 text-xs font-semibold text-zinc-300">
                      Архівовано
                    </span>
                  )}
                  <MessageContent message={mission.description} textOnly />
                  <MissionAuthorsText
                    mission={mission}
                    className="mt-3 text-sm text-zinc-500"
                    userClassName="text-zinc-300"
                  />
                </div>

                <View.Condition if={hasMissionActions}>
                  <Popover
                    open={missionActionsOpen}
                    onChange={setMissionActionsOpen}
                    className="flex w-56 flex-col gap-2 p-2"
                    trigger={
                      <Button type="button" size="icon" variant="outline" aria-label="Дії з місією">
                        <EllipsisIcon className="size-5" />
                      </Button>
                    }>
                    <View.Condition if={canEditMission}>
                      <Button
                        type="button"
                        onClick={() => {
                          setMissionActionsOpen(false);
                          handleMissionUpdate();
                        }}
                        variant="ghost"
                        align="left"
                        className="w-full justify-start gap-2">
                        <EditIcon className="size-4" />
                        Редагувати
                      </Button>
                    </View.Condition>

                    <View.Condition if={canChangeMissionState}>
                      <Button
                        type="button"
                        onClick={() => {
                          setMissionActionsOpen(false);
                          handleChangeMissionState();
                        }}
                        variant="ghost"
                        align="left"
                        className="w-full justify-start gap-2">
                        {mission.state === State.ARCHIVED ? (
                          <ArchiveRestoreIcon className="size-4" />
                        ) : (
                          <ArchiveIcon className="size-4" />
                        )}
                        {mission.state === State.ARCHIVED ? 'Розархівувати' : 'Архівувати'}
                      </Button>
                    </View.Condition>

                    <View.Condition if={canDeleteMission}>
                      <Button
                        type="button"
                        variant="ghost"
                        align="left"
                        className="w-full justify-start gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => {
                          setMissionActionsOpen(false);
                          deleteMissionModel.visibility.open({
                            missionId: mission.id,
                            missionName: mission.name,
                          });
                        }}>
                        <Trash2Icon className="size-4" />
                        Видалити
                      </Button>
                    </View.Condition>
                  </Popover>
                </View.Condition>
              </div>
            </div>
          </div>

          {/* Last Version Details */}
          {mission?.missionVersions && mission.missionVersions.length > 0 && (
            <div key={mission.missionVersions?.[0]?.id} className="border-t border-white/10 pt-6">
              {mission.missionVersions?.[0]?.version && (
                <h2 className="text-xl font-bold text-white mb-4">
                  Остання версія: {mission.missionVersions?.[0]?.version}
                </h2>
              )}
              <MissionVersionCard
                fullWidth
                version={mission.missionVersions?.[0]}
                missionId={missionId}
                canEdit={canEditMissionVersion}
                canDelete={canDeleteMissionVersion}
                canChangeStatus={canChangeMissionVersionStatus}
                defaultSectionsOpen
                onEdit={handleEditVersion}
                onDelete={setVersionToDelete}
                onChangeStatus={params => {
                  missionDetailsModel.changeMissionVersionStatusModel.visibility.open(params);
                }}
              />
            </div>
          )}

          {/* Versions Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Версії місії</h2>
                {isMissionArchived && (
                  <p className="mt-1 text-sm text-zinc-500">
                    Місія в архіві: створення та редагування версій недоступне.
                  </p>
                )}
              </div>
              <View.Condition if={canEditMissionVersion}>
                <Button variant="default" onClick={handleCreateVersion}>
                  <PlusIcon className="size-4" />
                  Створити версію
                </Button>
              </View.Condition>
            </div>

            {mission?.missionVersions?.length === 0 ? (
              <div className="paper flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center">
                <p className="text-zinc-400">Версій поки немає</p>
                <View.Condition if={canEditMissionVersion}>
                  <Button variant="default" onClick={handleCreateVersion}>
                    <PlusIcon className="size-4" />
                    Створити першу версію
                  </Button>
                </View.Condition>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {mission?.missionVersions?.map(version => (
                  <MissionVersionCard
                    key={version.id}
                    fullWidth
                    canEdit={canEditMissionVersion}
                    canDelete={canDeleteMissionVersion}
                    canChangeStatus={canChangeMissionVersionStatus}
                    version={version}
                    missionId={missionId}
                    onEdit={handleEditVersion}
                    onDelete={setVersionToDelete}
                    onChangeStatus={params => {
                      missionDetailsModel.changeMissionVersionStatusModel.visibility.open(params);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-white/10 mt-6 pt-2">
            <h2 className="text-2xl font-bold text-white">Коментарі</h2>

            {missionDetailsModel.commentModel.pagination.preloader.isLoading &&
            missionDetailsModel.commentModel.pagination.data.length === 0 ? (
              <p className="text-zinc-500 text-sm">
                <LoaderIcon className="size-4 animate-spin flex items-center justify-center" />
              </p>
            ) : missionDetailsModel.commentModel.pagination.data.length === 0 ? (
              <div className="text-white text-sm py-4 text-center h-10 mb-8">Наразі жодних коментарів немає</div>
            ) : (
              <CommentList
                className="mb-2"
                comments={missionDetailsModel.commentModel.pagination.data}
                canDeleteComment={canDeleteComment}
                canEditComment={canEditComment}
                onDeleteComment={handleDeleteComment}
                onEditComment={handleEditComment}
              />
            )}

            <View.Condition if={session.isAuthorized}>
              <div className="mb-4">
                {session.isCommunicationMuted && (
                  <div className="mb-2 text-xs text-amber-300">
                    Вам заборонено писати коментарі на час блокування
                    {session.user.user?.bannedUntil
                      ? ` до ${dayjs(session.user.user.bannedUntil).format('DD.MM.YYYY HH:mm')}`
                      : ''}
                    .
                  </div>
                )}
                <MessageComposer
                  placeholder="Додати коментар..."
                  disabled={session.isCommunicationMuted}
                  onSubmit={async ({ lexicalState, attachments }) => {
                    await missionDetailsModel.commentModel.create(missionId, lexicalState, attachments);
                  }}
                />
              </div>
            </View.Condition>
          </div>
        </div>
      </div>
    </Layout>
  );
});

export default MissionDetailsPage;
