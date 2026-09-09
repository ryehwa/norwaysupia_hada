import SiteHeader from '@/components/user/SiteHeader';
import SiteFooter from '@/components/user/SiteFooter';
import FloatingContact from '@/components/user/FloatingContact';

/** 유저 사이트 전용 껍데기. 플로팅 버튼은 관리자 콘솔에서는 뜨지 않는다. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <FloatingContact />
    </>
  );
}
