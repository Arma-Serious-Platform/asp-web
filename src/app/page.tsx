'use client';
import { InstallationGuide, InstallationGuideLinks, TeamSpeakGuide } from '@/features/guide/installation-guide/ui';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/atoms/button';
import { Hero } from '@/widgets/hero';
import { Layout } from '@/widgets/layout';
import { Section } from '@/shared/ui/organisms/section';
import { AlertTriangleIcon } from 'lucide-react';
import Link from 'next/link';
import { View } from '@/features/view';
import { session } from '@/entities/session/model';

export default function Home() {
  return (
    <Layout headerProps={{ enableScrollVisibility: true }}>
      <Hero variant="home" />
      <Section sectionClassName="py-10" id="about" eyebrow="Про проект" title="VTG" background={false}>
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-12">
          <section className="paper relative flex w-full flex-col gap-6 rounded-xl px-6 py-6 shadow-xl lg:w-2/3">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-linear-to-br from-white/5 via-transparent to-white/5" />

            <div className="flex flex-col gap-4 text-lg max-lg:text-base">
              <p className="max-lg:text-center text-zinc-100">
                Virtual Tactical Games — українська TvT спільнота у Arma 3.
              </p>
              <p className="text-zinc-200">
                Ми організовуємо масштабні бойові сценарії у форматі командних протистоянь, де гравці взаємодіють у
                групах і виконують завдання в умовах, максимально наближених до реальних умов сучасного бою.
              </p>

              <p className="text-zinc-200">
                Спільнота існує понад два роки та регулярно збирає{' '}
                <span className="text-primary font-semibold">понад 100 гравців</span> на щотижневі ігрові події.
              </p>

              <div className="mt-4 rounded-lg border border-white/10 bg-black/60 px-4 py-4 text-sm text-zinc-200">
                <h3 className="text-lg font-semibold max-lg:text-center">Анонси ігор VTG</h3>
                <p className="mt-2 max-lg:text-center">
                  Ігри проходять по <span className="text-primary font-semibold">п&apos;ятницях</span> та{' '}
                  <span className="text-primary font-semibold">неділях</span>:
                </p>
                <ul className="mt-3 list-disc list-inside space-y-1.5 leading-7">
                  <li>
                    Час збору: <span className="text-primary font-semibold">19:30</span> (Київський час) на сервері
                    TeamSpeak 3 та Arma 3.
                  </li>
                  <li>
                    Початок гри: <span className="text-primary font-semibold">20:00</span> (Київський час).
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <aside className="hidden items-end justify-end lg:flex lg:w-1/3">
            <div className="relative w-full max-w-sm">
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl" />
              <div className="overflow-hidden rounded-2xl">
                <img src="/images/two-dudes.webp" alt="VTG operators" className="h-full w-full object-cover" />
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <Section sectionClassName="py-10" id="media" eyebrow="Медіа" title="Медіа спільноти VTG">
        <div className="mt-2 grid gap-4 md:grid-cols-3">
          {['FM8vrA0lxJk', '1gkel2PLFbQ', 'fkB43EAEV-E'].map(id => (
            <div
              key={id}
              className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-md">
              <div className="relative w-full aspect-5/5">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${id}`}
                  title="VTG video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        sectionClassName="py-10"
        id="installation-guide"
        eyebrow="Інструкція"
        title="Як почати грати"
        background={false}
        withCard={false}>
        <div>
          <h3 className="text-3xl font-bold max-lg:text-center">
            <span className="text-primary">1.</span> Реєстрація на сайті та підключення Steam ID
          </h3>
          <div className="paper mt-6 rounded-xl border px-6 py-6 shadow-md">
            <div className="flex flex-col gap-4 text-lg text-zinc-200">
              <p>
                Зареєструйтеся на сайті VTG, після чого відкрийте свій профіль і натисніть <b>«Підключити Steam»</b>.{' '}
                <br />
                Авторизуйтеся через Steam, щоб прив&apos;язати Steam ID до облікового запису.
              </p>
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
                <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden />
                Нікнейм у грі має збігатися з нікнеймом у профілі сайту.
              </div>
              <div className="flex flex-wrap gap-3">
                <View.Condition if={!session.isAuthorized}>
                  <Button asChild>
                    <Link href={ROUTES.auth.signup}>Зареєструватися</Link>
                  </Button>
                </View.Condition>
                <View.Condition if={session.isAuthorized}>
                  <Button asChild variant="outline">
                    <Link href={`${ROUTES.user.profile}?tab=profile`}>Перейти до профілю</Link>
                  </Button>
                </View.Condition>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-3xl font-bold max-lg:text-center">
            <span className="text-primary">2.</span> Встановлення збірки
          </h3>

          <div className="mx-auto mt-6 max-w-3xl">
            <div className="paper overflow-hidden rounded-2xl border shadow-xl">
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/wOaGAuV6YcU"
                  title="Відеогайд встановлення збірки VTG"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div>
              <h4 className="text-2xl font-bold max-lg:text-center">Кроки</h4>
              <InstallationGuide className="paper mt-4 w-full rounded-xl border px-4 py-4 shadow-md" />
            </div>

            <div className="max-lg:w-full">
              <h4 className="text-2xl font-bold max-lg:text-center">Посилання на моди та ключі</h4>
              <InstallationGuideLinks className="paper mt-4 w-full max-lg:mx-auto rounded-xl border px-4 py-4 shadow-md" />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-3xl font-bold max-lg:text-center">
            <span className="text-primary">3.</span> Встановлення Task Force Radio
          </h3>
          <TeamSpeakGuide className="paper mt-6 w-full max-lg:mx-auto rounded-xl border px-4 py-4 shadow-md" />
        </div>
      </Section>
    </Layout>
  );
}
