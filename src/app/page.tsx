import { Hero } from '@/widgets/hero';
import { Layout } from '@/widgets/layout';
import Image from 'next/image';

export default function Home() {
  return (
    <Layout headerProps={{ enableScrollVisibility: true }}>
      <Hero />
      <div className='bg-black/20 w-full'>
        <div className='container mx-auto w-full flex justify-between p-12 pb-4'>
          <div id='about' className='w-full flex flex-col gap-4'>
            <h2 className='text-6xl font-bold'>VTG</h2>
            <div className='flex flex-col gap-6 text-xl'>
              <p>Virtual Tactical Games — українська спільнота TvT у Arma 3.</p>
              <p>
                Ми організовуємо масштабні бойові сценарії у форматі командних
                протистоянь, де гравці взаємодіють у групах і виконують завдання
                в умовах, максимально наближених до реальних.
              </p>
              <p>
                Спільнота існує понад два роки та регулярно збирає{' '}
                <span className='text-primary'>понад 100 гравців</span> на
                щотижневі ігрові події.
              </p>
            </div>
          </div>
          <div className='w-full flex justify-end'>
            <Image
              src='/images/two-dudes.webp'
              width={318}
              height={397}
              alt='VTG logo'
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
