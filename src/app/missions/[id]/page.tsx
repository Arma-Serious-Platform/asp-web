'use client';

import { Layout } from '@/widgets/layout';
import { Button } from '@/shared/ui/atoms/button';
import { missionsApi } from '@/shared/sdk';
import { Mission, MissionVersion, State, UserRole } from '@/shared/sdk/types';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  EllipsisIcon,
  LoaderIcon,
  EditIcon,
  Trash2Icon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/shared/config/routes';
import { ChangeMissionVersionStatusModal } from './ui/change-mission-status';
import { CreateUpdateMissionVersionModal } from './ui/create-update-version';
import { UpdateMissionModal } from './ui/update-mission';
import { MissionDetailsState } from './state/mission-details.state';
import { DeleteMissionState } from './state/delete-mission.state';
import { VersionsSection } from './ui/versions-section';
import { CommentsSection } from './ui/comments-section';
import { View } from '@/features/view';
import { session } from '@/entities/session/session.state';
import { UserModel } from '@/entities/user/user.model';
import { observer } from 'mobx-react-lite';
import { MessageComposerSubmitPayload } from '@/features/chat/message-composer/message-composer';
import type { CommentViewModel } from '@/entities/comment/types';
import { DeleteMissionCommentModal } from '@/app/missions/[id]/ui/delete-comment';
import { DeleteMissionCommentState } from '@/app/missions/[id]/state/delete-comment.state';
import { DeleteMissionModal } from './ui/delete-mission';
import { ChangeMissionStateModal } from './ui/change-mission-state';
import { MissionAuthorsText } from '@/entities/mission/mission-authors-text';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';
import { MessageContent } from '@/entities/comment/lexical-message';
import { Popover } from '@/shared/ui/moleculas/popover';

const MissionDetailsPage = observer(() => {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [versionToDelete, setVersionToDelete] = useState<MissionVersion | null>(null);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  const [missionActionsOpen, setMissionActionsOpen] = useState(false);
  const missionDetailsState = useMemo(() => new MissionDetailsState(), []);
  const deleteCommentModel = useMemo(() => new DeleteMissionCommentState(), []);
  const deleteMissionState = useMemo(() => new DeleteMissionState(), []);
  const currentUserId = session.user?.data?.id;

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
    UserModel.hasAnyRole(session.user?.data?.roles, [UserRole.OWNER, UserRole.UVK]);
  const hasMissionActions = canEditMission || canChangeMissionState || canDeleteMission;

  useEffect(() => {
    if (!session.isSessionReady || !session.isAuthorized) return;

    const loadMission = async () => {
      try {
        setIsLoading(true);
        const response = await missionsApi.findMissionById(missionId);
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
      missionDetailsState.commentModel.pagination.loadAll({
        missionId,
      });
    }
  }, [missionId, session.isAuthorized, session.isSessionReady, missionDetailsState.commentModel.pagination]);

  const handleCreateVersion = () => {
    if (!mission) return;
    if (mission.state === State.ARCHIVED) {
      toast.error('Неможливо створити версію для архівованої місії');
      return;
    }

    missionDetailsState.createUpdateMissionVersionState.visibility.open({
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

    missionDetailsState.createUpdateMissionVersionState.visibility.open({
      missionId,
      mission,
      version,
    });
  };

  const handleVersionSaved = async () => {
    const response = await missionsApi.findMissionById(missionId);
    setMission(response.data);
  };

  const handleMissionUpdate = () => {
    if (!mission) return;
    missionDetailsState.updateMissionState.visibility.open({
      mission,
    });
  };

  const handleMissionSaved = async () => {
    const response = await missionsApi.findMissionById(missionId);
    setMission(response.data);
  };

  const handleDeleteMission = async (id: string) => {
    try {
      await missionsApi.deleteMission(id);
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
    missionDetailsState.changeMissionStateState.visibility.open({
      mission,
      state: nextState,
    });
  };

  const handleDeleteVersion = async () => {
    if (!versionToDelete) return;

    try {
      setIsDeletingVersion(true);
      await missionsApi.deleteMissionVersion(missionId, versionToDelete.id);
      toast.success('Версію місії видалено');
      setVersionToDelete(null);
      await handleVersionSaved();
    } catch {
      toast.error('Не вдалося видалити версію місії');
    } finally {
      setIsDeletingVersion(false);
    }
  };

  const canDeleteComment = (comment: CommentViewModel) => {
    const userId = session.user?.data?.id;
    const isCommentAuthor = Boolean(userId && (comment.userId === userId || comment.user?.id === userId));

    return session.isHasAdminPanelAccess || isCommentAuthor;
  };

  const canEditComment = (comment: CommentViewModel) => {
    if (session.isCommunicationMuted) {
      return false;
    }

    const userId = session.user?.data?.id;
    return Boolean(userId && (comment.userId === userId || comment.user?.id === userId));
  };

  const handleDeleteComment = (comment: CommentViewModel) => {
    deleteCommentModel.visibility.open({ comment: comment as any });
  };

  const handleEditComment = async (comment: CommentViewModel, payload: MessageComposerSubmitPayload) => {
    await missionDetailsState.commentModel.update(comment.id, missionId, payload);
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
            <p className="mb-4 text-zinc-400">Місію не знайдено</p>
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
        state={missionDetailsState.changeMissionVersionStatusState}
        onSuccess={async () => {
          const response = await missionsApi.findMissionById(missionId);
          setMission(response.data);
        }}
      />
      <CreateUpdateMissionVersionModal
        state={missionDetailsState.createUpdateMissionVersionState}
        onSuccess={handleVersionSaved}
      />
      <UpdateMissionModal state={missionDetailsState.updateMissionState} onSuccess={handleMissionSaved} />
      <ChangeMissionStateModal
        state={missionDetailsState.changeMissionStateState}
        onSuccess={state =>
          setMission(currentMission => (currentMission ? { ...currentMission, state } : currentMission))
        }
      />
      <DeleteMissionCommentModal
        model={deleteCommentModel}
        onConfirm={commentId => missionDetailsState.commentModel.remove(missionId, commentId)}
      />
      <DeleteMissionModal state={deleteMissionState} onConfirm={handleDeleteMission} />
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
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
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
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-neutral-800 to-neutral-900">
                  <span className="text-sm text-zinc-500">Немає зображення</span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
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
                          deleteMissionState.visibility.open({
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

          <VersionsSection
            mission={mission}
            missionId={missionId}
            canEditMissionVersion={canEditMissionVersion}
            canDeleteMissionVersion={canDeleteMissionVersion}
            canChangeMissionVersionStatus={canChangeMissionVersionStatus}
            isMissionArchived={isMissionArchived}
            onCreateVersion={handleCreateVersion}
            onEditVersion={handleEditVersion}
            onDeleteVersion={setVersionToDelete}
            onChangeStatus={params => {
              missionDetailsState.changeMissionVersionStatusState.visibility.open(params);
            }}
          />

          <CommentsSection
            missionId={missionId}
            commentModel={missionDetailsState.commentModel}
            canDeleteComment={canDeleteComment}
            canEditComment={canEditComment}
            onDeleteComment={handleDeleteComment}
            onEditComment={handleEditComment}
          />
        </div>
      </div>
    </Layout>
  );
});

export default MissionDetailsPage;
