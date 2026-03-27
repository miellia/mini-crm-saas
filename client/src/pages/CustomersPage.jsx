import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { cn, formatDate, getInitials, statusColors, tagColors } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Users,
  ChevronDown,
  X,
} from 'lucide-react';

const STATUSES = ['all', 'Lead', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const TAG_OPTIONS = ['VIP', 'Frequent', 'Lead', 'Enterprise', 'Startup'];

/**
 * CustomersPage Component
 * 
 * Provides a comprehensive tabular view of all customers.
 * Includes capabilities for full-text search, status filtering, and CRUD operations.
 */
export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Lead',
    tags: [],
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/customers', { params });
      setCustomers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  const openCreateForm = () => {
    setEditingCustomer(null);
    setForm({ name: '', email: '', phone: '', company: '', status: 'Lead', tags: [], notes: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      status: customer.status,
      tags: customer.tags || [],
      notes: customer.notes || '',
    });
    setFormError('');
    setShowForm(true);
    setActionMenu(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer._id}`, form);
      } else {
        await api.post('/customers', form);
      }
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    <>
      <Header
        title="Customers"
        subtitle={`${customers.length} total customers`}
      />

      <div className="p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 appearance-none focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'all' ? 'All Status' : s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <Button onClick={openCreateForm} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl bg-gray-100 p-4 mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No customers found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first customer'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">
                    Company
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">
                    Tags
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">
                    Added
                  </th>
                  <th className="py-3.5 px-5 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((customer, idx) => (
                  <tr
                    key={customer._id}
                    className="group transition-colors hover:bg-gray-50/70 animate-fade-in"
                    style={{ animationDelay: `${idx * 0.03}s` }}
                  >
                    <td className="py-3.5 px-5">
                      <Link
                        to={`/customers/${customer._id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 text-sm font-semibold">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {customer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3.5 px-5 hidden md:table-cell">
                      <p className="text-sm text-gray-600">
                        {customer.company || '—'}
                      </p>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge className={statusColors[customer.status]}>
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.length > 0
                          ? customer.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={cn(
                                  'text-[10px]',
                                  tagColors[tag] || ''
                                )}
                              >
                                {tag}
                              </Badge>
                            ))
                          : <span className="text-xs text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 hidden lg:table-cell">
                      <p className="text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </p>
                    </td>
                    <td className="py-3.5 px-5 relative">
                      <button
                        onClick={() =>
                          setActionMenu(
                            actionMenu === customer._id ? null : customer._id
                          )
                        }
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {actionMenu === customer._id && (
                        <div className="absolute right-5 top-12 z-20 w-44 rounded-xl bg-white border border-gray-100 shadow-xl py-1.5 animate-scale-in">
                          <Link
                            to={`/customers/${customer._id}`}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Link>
                          <button
                            onClick={() => openEditForm(customer)}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirm(customer);
                              setActionMenu(null);
                            }}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Click-away for action menu */}
      {actionMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActionMenu(null)}
        />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Update customer information below.'
                : 'Fill in the details to add a new customer.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {['Lead', 'Contacted', 'Qualified', 'Converted', 'Lost'].map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200',
                        form.status === s
                          ? statusColors[s] + ' ring-2 ring-offset-1 ring-primary-400/30'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200',
                      form.tags.includes(tag)
                        ? (tagColors[tag] || 'bg-primary-50 text-primary-700 border-primary-200') +
                          ' ring-2 ring-offset-1 ring-primary-400/30'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add any relevant notes..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : editingCustomer ? (
                  'Save Changes'
                ) : (
                  'Add Customer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deleteConfirm?.name}</strong>? This action cannot be
              undone and will also remove all their interactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteConfirm._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
