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
      <div className='bg-black/20 w-full'>
        <div className='container mx-auto w-full flex justify-between p-12 pb-4'>
          <div id='about' className='w-full flex flex-col gap-4'>
            <h2 className='text-6xl font-bold max-lg:text-center'>VTG</h2>
            <div className='flex flex-col gap-6 text-xl max-lg:text-base'>
              <p className='max-lg:text-center'>
                Virtual Tactical Games — українська TvT спільнота у Arma 3.
              </p>
              <p>
                Ми організовуємо масштабні бойові сценарії у форматі командних
                протистоянь, де гравці взаємодіють у групах і виконують завдання
                в умовах, максимально наближених до реальних.
              </p>
              <img
                src='/images/two-dudes.webp'
                alt='VTG logo'
                className='w-1/2 float-left min-lg:hidden mx-auto'
              />
              <p>
                Спільнота існує понад два роки та регулярно збирає{' '}
                <span className='text-primary'>понад 100 гравців</span> на
                щотижневі ігрові події.
              </p>
              <div className='mt-10'>
                <h2 className='text-2xl font-bold max-lg:text-center'>
                  Ігри VTG проходять по{' '}
                  <span className='text-primary'>п&apos;ятницях</span> та{' '}
                  <span className='text-primary'>неділях</span>:
                </h2>
                <p></p>
                <ul className='list-disc list-inside [&>li]:pl-4 leading-8'>
                  <li>
                    Час збору: <span className='text-primary'>19:30</span>{' '}
                    (Київський час) на сервері TeamSpeak 3 та Arma 3.
                  </li>
                  <li>
                    Початок гри: <span className='text-primary'>20:00</span>{' '}
                    (Київський час).
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <img
            src='/images/two-dudes.webp'
            alt='VTG logo'
            className='w-1/3 flex justify-end ml-auto max-lg:hidden'
          />
        </div>
      </div>

      <div className='mx-auto w-full flex flex-col justify-between p-12 pb-4 bg-black/40'>
        <div className='container mx-auto flex max-lg:flex-col gap-4'>
          <div className='min-lg:w-2/3 max-lg:w-full'>
            <h2
              id='installation-guide'
              className='text-3xl font-bold mx-auto max-lg:text-center'>
              Встановлення збірки
            </h2>

            <div className='flex gap-4'>
              <InstallationGuide className='mt-8' />
            </div>
          </div>

          <div className='max-lg:mt-8'>
            <h2
              id='installation-guide'
              className='text-3xl font-bold mx-auto max-lg:text-center'>
              Посилання на моди та ключі
            </h2>
            <InstallationGuideLinks className='mt-8 w-full max-lg:mx-auto' />
          </div>
        </div>

        <div className='mt-10 container mx-auto'>
          <h2 className='text-3xl font-bold mx-auto max-lg:text-center'>
            Встановлення Task Force Radio
          </h2>
          <TeamSpeakGuide className='mt-8 w-full max-lg:mx-auto' />
        </div>
      </div>
    </Layout>
  );
}
