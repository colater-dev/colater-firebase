import localFont from "next/font/local";
import {
  Aboreto,
  Archivo,
  BioRhyme_Expanded,
  Cabin,
  Caprasimo,
  Commissioner,
  Corben,
  Faculty_Glyphic,
  Fraunces,
  Freeman,
  Gabarito,
  Genos,
  Hepta_Slab,
  Instrument_Sans,
  Instrument_Serif,
  Jomhuria,
  Jost,
  Julius_Sans_One,
  Kodchasan,
  Lexend,
  Michroma,
  Nixie_One,
  Rowdies,
  Saira,
  Tektur,
  Tilt_Warp
} from 'next/font/google';
import "./globals.css";
import { ClientLayout } from "@/components/layout";
import { Metadata } from 'next';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Google Fonts (alphabetically sorted)
const aboreto = Aboreto({ subsets: ['latin'], variable: '--font-aboreto', weight: ['400'] });
const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', weight: ['400', '500', '600', '700', '800', '900'] });
const biorhymeExpanded = BioRhyme_Expanded({ subsets: ['latin'], variable: '--font-biorhyme-expanded', weight: ['400', '700', '800'] });
const cabin = Cabin({ subsets: ['latin'], variable: '--font-cabin', weight: ['400', '500', '600', '700'] });
const caprasimo = Caprasimo({ subsets: ['latin'], variable: '--font-caparasimo', weight: ['400'] });
const commissioner = Commissioner({ subsets: ['latin'], variable: '--font-commissioner', weight: ['400', '500', '600', '700', '800', '900'] });
const corben = Corben({ subsets: ['latin'], variable: '--font-corben', weight: ['400', '700'] });
const facultyGlyphic = Faculty_Glyphic({ subsets: ['latin'], variable: '--font-faculty-glyphic', weight: ['400'] });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['400', '500', '600', '700', '800', '900'] });
const freeman = Freeman({ subsets: ['latin'], variable: '--font-freeman', weight: ['400'] });
const gabarito = Gabarito({ subsets: ['latin'], variable: '--font-gabarito', weight: ['400', '500', '600', '700', '800', '900'] });
const genos = Genos({ subsets: ['latin'], variable: '--font-genos', weight: ['400', '500', '600', '700', '800', '900'] });
const heptaSlab = Hepta_Slab({ subsets: ['latin'], variable: '--font-hepta-slab', weight: ['400', '500', '600', '700', '800', '900'] });
const instrumentSans = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument-sans', weight: ['400', '500', '600', '700'] });
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], variable: '--font-instrument-serif', weight: ['400'] });
const jomhuria = Jomhuria({ subsets: ['latin'], variable: '--font-jomhuria', weight: ['400'] });
const jost = Jost({ subsets: ['latin'], variable: '--font-jost', weight: ['400', '500', '600', '700', '800', '900'] });
const juliusSansOne = Julius_Sans_One({ subsets: ['latin'], variable: '--font-julius-sans-one', weight: ['400'] });
const kodchasan = Kodchasan({ subsets: ['latin'], variable: '--font-kodchasan', weight: ['400', '500', '600', '700'] });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend', weight: ['400', '500', '600', '700', '800', '900'] });
const michroma = Michroma({ subsets: ['latin'], variable: '--font-michroma', weight: ['400'] });
const nixieOne = Nixie_One({ subsets: ['latin'], variable: '--font-nixie-one', weight: ['400'] });
const rowdies = Rowdies({ subsets: ['latin'], variable: '--font-rowdies', weight: ['300', '400', '700'] });
const saira = Saira({ subsets: ['latin'], variable: '--font-saira', weight: ['400', '500', '600', '700', '800', '900'] });
const tektur = Tektur({ subsets: ['latin'], variable: '--font-tektur', weight: ['400', '500', '600', '700', '800', '900'] });
const tiltWarp = Tilt_Warp({ subsets: ['latin'], variable: '--font-tilt-warp', weight: ['400'] });

export const metadata: Metadata = {
  title: {
    default: 'Colater',
    template: '%s | Colater'
  },
  description: 'AI-powered brand identity design platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`
        ${geistSans.variable} 
        ${geistMono.variable}
        ${aboreto.variable}
        ${archivo.variable}
        ${biorhymeExpanded.variable}
        ${cabin.variable}
        ${caprasimo.variable}
        ${commissioner.variable}
        ${corben.variable}
        ${facultyGlyphic.variable}
        ${fraunces.variable}
        ${freeman.variable}
        ${gabarito.variable}
        ${genos.variable}
        ${heptaSlab.variable}
        ${instrumentSans.variable}
        ${instrumentSerif.variable}
        ${jomhuria.variable}
        ${jost.variable}
        ${juliusSansOne.variable}
        ${kodchasan.variable}
        ${lexend.variable}
        ${michroma.variable}
        ${nixieOne.variable}
        ${rowdies.variable}
        ${saira.variable}
        ${tektur.variable}
        ${tiltWarp.variable}
        font-sans antialiased
      `}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
