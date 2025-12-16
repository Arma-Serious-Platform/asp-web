import {
  InstallationGuide,
  InstallationGuideLinks,
  TeamSpeakGuide,
} from '@/features/guide/installation-guide/ui';
import { Hero } from '@/widgets/hero';
import { Layout } from '@/widgets/layout';

export default function Home() {
  return (
    <Layout headerProps={{ enableScrollVisibility: true }}>
      <Hero variant='home' />
      <div className='w-full bg-black/30'>
        <div className='container mx-auto flex w-full flex-col gap-10 px-4 pb-6 pt-10 lg:flex-row lg:items-stretch lg:gap-12'>
          <section
            id='about'
            className='paper relative flex w-full flex-col gap-6 rounded-xl px-6 py-6 shadow-xl lg:w-2/3'
          >
            <div className='pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-emerald-500/5' />
            <header className='flex flex-col gap-2 max-lg:text-center'>
              <span className='text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400'>
                Virtual Tactical Games
              </span>
              <h2 className='text-4xl font-extrabold tracking-tight lg:text-5xl'>
                VTG
              </h2>
            </header>

            <div className='flex flex-col gap-4 text-lg max-lg:text-base'>
              <p className='max-lg:text-center text-zinc-100'>
                Virtual Tactical Games — українська TvT спільнота у Arma 3.
              </p>
              <p className='text-zinc-200'>
                Ми організовуємо масштабні бойові сценарії у форматі командних
                протистоянь, де гравці взаємодіють у групах і виконують завдання
                в умовах, максимально наближених до реальних умов сучасного бою.
              </p>

              {/* <img
                src='/images/two-dudes.webp'
                alt='VTG team'
                className='mx-auto w-1/2 max-lg:block lg:hidden'
              /> */}

              <p className='text-zinc-200'>
                Спільнота існує понад два роки та регулярно збирає{' '}
                <span className='text-primary font-semibold'>
                  понад 100 гравців
                </span>{' '}
                на щотижневі ігрові події.
              </p>

              <div className='mt-4 rounded-lg border border-white/10 bg-black/60 px-4 py-4 text-sm text-zinc-200'>
                <h3 className='text-lg font-semibold max-lg:text-center'>
                  Розклад ігор VTG
                </h3>
                <p className='mt-2 max-lg:text-center'>
                  Ігри проходять по{' '}
                  <span className='text-primary font-semibold'>п&apos;ятницях</span>{' '}
                  та{' '}
                  <span className='text-primary font-semibold'>неділях</span>:
                </p>
                <ul className='mt-3 list-disc list-inside space-y-1.5 leading-7'>
                  <li>
                    Час збору:{' '}
                    <span className='text-primary font-semibold'>19:30</span>{' '}
                    (Київський час) на сервері TeamSpeak 3 та Arma 3.
                  </li>
                  <li>
                    Початок гри:{' '}
                    <span className='text-primary font-semibold'>20:00</span>{' '}
                    (Київський час).
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <aside className='hidden items-end justify-end lg:flex lg:w-1/3'>
            <div className='relative w-full max-w-sm'>
              <div className='pointer-events-none absolute inset-0 -z-10 rounded-2xl' />
              <div className='overflow-hidden rounded-2xl'>
                <img
                  src='/images/two-dudes.webp'
                  alt='VTG operators'
                  className='h-full w-full object-cover'
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className='mx-auto w-full bg-black/50 pb-8 pt-8'>
        <div className='container mx-auto flex gap-6 px-4 max-lg:flex-col'>
          <div className='max-lg:w-full lg:w-2/3'>
            <h2
              id='installation-guide'
              className='mx-auto text-3xl font-bold max-lg:text-center'>
              Встановлення збірки
            </h2>

            <div className='mt-6 flex gap-4'>
              <InstallationGuide className='paper mt-2 w-full rounded-xl border px-4 py-4 shadow-md' />
            </div>
          </div>

          <div className='max-lg:mt-8 max-lg:w-full lg:w-1/3'>
            <h2
              id='installation-guide'
              className='mx-auto text-3xl font-bold max-lg:text-center'>
              Посилання на моди та ключі
            </h2>
            <InstallationGuideLinks className='paper mt-6 w-full max-lg:mx-auto rounded-xl border px-4 py-4 shadow-md' />
          </div>
        </div>

        <div className='container mx-auto mt-10 px-4'>
          <h2 className='mx-auto text-3xl font-bold max-lg:text-center'>
            Встановлення Task Force Radio
          </h2>
          <TeamSpeakGuide className='paper mt-6 w-full max-lg:mx-auto rounded-xl border px-4 py-4 shadow-md' />
        </div>
      </div>
    </Layout>
  );
}
