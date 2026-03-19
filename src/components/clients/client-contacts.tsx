"use client";

import { useActionState, useRef, useTransition } from "react";
import { ClientContact } from "@prisma/client";
import { addClientContactAction, deleteClientContactAction } from "@/lib/client-actions";
import { Users, Phone, Mail, Loader2, Trash2, Plus, Star } from "lucide-react";

interface ClientContactsProps {
  clientId: number;
  contacts: ClientContact[];
}

export function ClientContacts({ clientId, contacts }: ClientContactsProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isDeleting, startDelete] = useTransition();

  // Handle Add Contact
  async function handleAddAction(_prev: any, fd: FormData) {
    const res = await addClientContactAction(clientId, _prev, fd);
    if (res.success) {
      formRef.current?.reset();
    }
    return res;
  }
  const [addState, addFormAction, isAdding] = useActionState(handleAddAction, undefined);

  // Handle Delete
  const handleDelete = (contactId: number) => {
    if (confirm("Xóa người liên hệ này?")) {
      startDelete(async () => {
        await deleteClientContactAction(contactId, clientId);
      });
    }
  };

  const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      {/* List */}
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 border border-dashed rounded-lg">
            <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Chưa có người liên hệ nào</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="relative p-4 bg-white border rounded-lg shadow-sm hover:border-gray-300 transition group">
              {contact.isPrimary && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-100 text-yellow-700 p-1.5 rounded-full shadow-sm border border-yellow-200">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </div>
              )}
              
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{contact.name}</h4>
                  {contact.position && (
                    <p className="text-xs text-gray-500 mt-0.5">{contact.position}</p>
                  )}
                  
                  <div className="mt-3 space-y-1.5">
                    {contact.phone && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        <a href={`tel:${contact.phone}`} className="hover:text-primary">{contact.phone}</a>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        <a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleDelete(contact.id)}
                  disabled={isDeleting}
                  className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title="Xóa liên hệ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Form */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Plus className="h-4 w-4 mr-1 text-primary" /> Thêm người liên hệ
        </h4>
        
        <form ref={formRef} action={addFormAction} className="space-y-3">
          {addState?.error && (
            <div className="text-xs text-danger bg-danger/10 p-2 rounded">{addState.error}</div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input type="text" name="name" required placeholder="Họ và tên *" className={inputCls} />
            </div>
            
            <div className="col-span-2">
              <input type="text" name="position" placeholder="Chức vụ (VD: HR Manager)" className={inputCls} />
            </div>
            
            <div>
              <input type="tel" name="phone" placeholder="Số điện thoại" className={inputCls} />
            </div>
            
            <div>
              <input type="email" name="email" placeholder="Email" className={inputCls} />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <label className="flex items-center text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" name="isPrimary" className="mr-2 rounded text-primary focus:ring-primary border-gray-300" />
              Liên hệ chính (Primary)
            </label>
            
            <button
              type="submit"
              disabled={isAdding}
              className="inline-flex items-center rounded-md bg-white border px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition"
            >
              {isAdding ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Đang thêm...</> : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
