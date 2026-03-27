import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { cn, formatDate, formatDateTime, getInitials, statusColors, tagColors } from '@/lib/utils';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  Clock,
  Tag,
} from 'lucide-react';

const INTERACTION_TYPES = [
  { value: 'note', label: 'Note', icon: FileText, color: 'text-gray-600 bg-gray-100' },
  { value: 'call', label: 'Call', icon: PhoneCall, color: 'text-blue-600 bg-blue-50' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'meeting', label: 'Meeting', icon: Video, color: 'text-purple-600 bg-purple-50' },
];

const TAG_OPTIONS = ['VIP', 'Frequent', 'Lead', 'Enterprise', 'Startup'];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit form
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Interaction form
  const [showInteraction, setShowInteraction] = useState(false);
  const [interactionForm, setInteractionForm] = useState({
    type: 'note',
    content: '',
  });
  const [interactionSubmitting, setInteractionSubmitting] = useState(false);

  // Delete
  const [showDelete, setShowDelete] = useState(false);

  const fetchData = async () => {
    try {
      const [custRes, intRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/customers/${id}/interactions`),
      ]);
      setCustomer(custRes.data.data);
      setInteractions(intRes.data.data);
    } catch (err) {
      console.error('Failed to fetch customer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const res = await api.put(`/customers/${id}`, editForm);
      setCustomer(res.data.data);
      setShowEdit(false);
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    setInteractionSubmitting(true);
    try {
      await api.post(`/customers/${id}/interactions`, interactionForm);
      setShowInteraction(false);
      setInteractionForm({ type: 'note', content: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to add interaction:', err);
    } finally {
      setInteractionSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/customers/${id}`);
      navigate('/customers');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/customers/${id}/status`, { status: newStatus });
      setCustomer(res.data.data);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const openEditForm = () => {
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      status: customer.status,
      tags: customer.tags || [],
      notes: customer.notes || '',
    });
    setShowEdit(true);
  };

  const toggleEditTag = (tag) => {
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  if (loading) {
    return (
      <>
        <Header title="Customer Details" />
        <div className="p-8">
          <div className="max-w-5xl mx-auto animate-pulse space-y-6">
            <div className="h-8 w-40 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!customer) {
    return (
      <>
        <Header title="Customer Not Found" />
        <div className="p-8 text-center">
          <p className="text-gray-500">This customer doesn't exist.</p>
          <Link to="/customers">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Customer Details" subtitle={customer.name} />

      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>

        {/* Top section: Info + Actions */}
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 text-xl font-bold">
                {getInitials(customer.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {customer.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.email}
                      </span>
                      {customer.phone && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.phone}
                        </span>
                      )}
                      {customer.company && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Building className="h-3.5 w-3.5" />
                          {customer.company}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(customer.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={openEditForm}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                      onClick={() => setShowDelete(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={statusColors[customer.status]}>
                    {customer.status}
                  </Badge>
                  {customer.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className={tagColors[tag] || ''}
                      variant="secondary"
                    >
                      <Tag className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Notes */}
                {customer.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {customer.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Status */}
            <Separator className="my-6" />
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Pipeline Stage
              </p>
              <div className="flex gap-2 flex-wrap">
                {['Lead', 'Contacted', 'Qualified', 'Converted', 'Lost'].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        'rounded-full px-4 py-2 text-xs font-semibold border transition-all duration-200',
                        customer.status === status
                          ? statusColors[status] + ' ring-2 ring-offset-2 ring-primary-400/30 shadow-sm'
                          : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                      )}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactions Timeline */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary-600" />
              Interactions
              <span className="text-sm font-normal text-gray-500">
                ({interactions.length})
              </span>
            </CardTitle>
            <Button size="sm" onClick={() => setShowInteraction(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Interaction
            </Button>
          </CardHeader>
          <CardContent>
            {interactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-2xl bg-gray-100 p-4 mb-3">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  No interactions yet
                </p>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Log your first interaction with this customer
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInteraction(true)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Interaction
                </Button>
              </div>
            ) : (
              <div className="relative space-y-0">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gray-100" />

                {interactions.map((interaction, idx) => {
                  const typeConfig = INTERACTION_TYPES.find(
                    (t) => t.value === interaction.type
                  ) || INTERACTION_TYPES[0];

                  return (
                    <div
                      key={interaction._id}
                      className="relative flex gap-4 py-4 animate-fade-in"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          typeConfig.color
                        )}
                      >
                        <typeConfig.icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 bg-gray-50 rounded-xl p-4 hover:bg-gray-100/80 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {typeConfig.label}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(interaction.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {interaction.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={editForm.company || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, company: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {['Lead', 'Contacted', 'Qualified', 'Converted', 'Lost'].map((s) => (
                  <button key={s} type="button" onClick={() => setEditForm({ ...editForm, status: s })}
                    className={cn('rounded-full px-3 py-1.5 text-xs font-medium border transition-all',
                      editForm.status === s ? statusColors[s] + ' ring-2 ring-offset-1 ring-primary-400/30' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    )}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleEditTag(tag)}
                    className={cn('rounded-full px-3 py-1.5 text-xs font-medium border transition-all',
                      editForm.tags?.includes(tag) ? (tagColors[tag] || 'bg-primary-50 text-primary-700 border-primary-200') + ' ring-2 ring-offset-1 ring-primary-400/30' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    )}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Interaction Dialog */}
      <Dialog open={showInteraction} onOpenChange={setShowInteraction}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
            <DialogDescription>
              Record a new interaction with {customer.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddInteraction} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {INTERACTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setInteractionForm({
                        ...interactionForm,
                        type: type.value,
                      })
                    }
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium border transition-all duration-200',
                      interactionForm.type === type.value
                        ? type.color + ' border-current ring-2 ring-offset-1 ring-primary-400/30'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interaction-content">Details</Label>
              <Textarea
                id="interaction-content"
                value={interactionForm.content}
                onChange={(e) =>
                  setInteractionForm({
                    ...interactionForm,
                    content: e.target.value,
                  })
                }
                placeholder="Describe the interaction..."
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInteraction(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={interactionSubmitting}>
                {interactionSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  'Log Interaction'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{customer.name}</strong>?
              This will permanently remove all their data and interactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
