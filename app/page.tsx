export const dynamic = "force-dynamic";
// Se quiser, pode até remover revalidate quando usar force-dynamic.
// Mas se quiser manter:
export const revalidate = 0;

import HomeClient from "./HomeClient";

export default function Page() {
  return <HomeClient />;
}