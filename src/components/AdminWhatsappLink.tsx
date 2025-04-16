
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const AdminWhatsappLink = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <li>
      <button
        onClick={() => navigate('/admin/whatsapp')}
        className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MessageSquare className="h-5 w-5 mr-3 text-blue-600" />
        <span>Admin WhatsApp</span>
      </button>
    </li>
  );
};

export default AdminWhatsappLink;
