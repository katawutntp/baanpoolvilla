import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/authContext';

export const metadata = {
  title: 'BaanPoolVilla - จองบ้านพักพูลวิลล่า',
  description: 'บริการจองบ้านพักพูลวิลล่า ราคาพิเศษ พัทยา หัวหิน เขาใหญ่ และทั่วประเทศ สระว่ายน้ำส่วนตัว',
  keywords: 'พูลวิลล่า, pool villa, บ้านพัก, จองบ้านพัก, พัทยา, หัวหิน, เขาใหญ่',
  openGraph: {
    title: 'BaanPoolVilla - จองบ้านพักพูลวิลล่า',
    description: 'บริการจองบ้านพักพูลวิลล่า ราคาพิเศษ สระว่ายน้ำส่วนตัว',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="antialiased">
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'Prompt, sans-serif',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
