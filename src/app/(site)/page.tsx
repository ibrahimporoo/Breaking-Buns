import CtaBanner from "@/components/modules/CtaBanner";
import Crew from "@/components/modules/Crew";
import Gallery from "@/components/modules/Gallery";
import Hero from "@/components/modules/Hero";
import MenuShowcase from "@/components/modules/MenuShowcase";
import Services from "@/components/modules/Services";
import Testimonials from "@/components/modules/Testimonials";
import { toJsonLdString } from "@/lib/json-ld";
import { restaurantJsonLd } from "@/lib/structured-data";

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/** Static page, rebuilt in the background at most once a minute. */
export const revalidate = 60;

export default async function Home() {

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // const { data: todos } = await supabase.from('todos').select()

  return (
    <main className="overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(restaurantJsonLd()) }}
      />
      <Hero />
      <MenuShowcase />
      <Services />
      <Gallery />
      <Crew />
      <Testimonials />
      <CtaBanner />
    </main>
  );
}
