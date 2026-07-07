import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProdutorForm } from "@/components/produtores/produtor-form";
import { createProdutorAction } from "@/lib/actions/produtores";

export default function NovoProdutorPage() {
  return (
    <div>
      <PageHeader title="Novo produtor" backHref="/produtores" />
      <Card>
        <CardContent>
          <ProdutorForm action={createProdutorAction} />
        </CardContent>
      </Card>
    </div>
  );
}
