import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { getClientById } from "@/lib/clients";
import { ClientForm } from "@/components/clients/client-form";
import { ClientContacts } from "@/components/clients/client-contacts";
import { DeleteClientButton } from "@/components/clients/delete-client-button";

export const metadata = { title: "Chi tiết Doanh nghiệp — Headhunt Manager" };

interface PageProps { params: Promise<{ id: string }> }

export default async function ClientDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  if (isNaN(id)) notFound();

  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link href="/clients" className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition mb-4">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Danh sách doanh nghiệp
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{client.companyName}</h1>
              <p className="mt-1 text-sm text-muted">
                Tạo ngày {client.createdAt.toLocaleDateString("vi-VN")}
                {client.createdBy && ` bởi ${client.createdBy.name}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0 pt-8 sm:pt-4">
          <DeleteClientButton id={client.id} />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: General Info */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-surface shadow-sm p-6">
            <ClientForm initialData={client} />
          </div>
        </div>

        {/* Right: Contacts */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h2 className="text-base font-semibold text-foreground">Người liên hệ</h2>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {client.contacts.length}
              </span>
            </div>
            <ClientContacts 
              clientId={client.id} 
              contacts={client.contacts} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
