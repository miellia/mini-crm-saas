import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { cn, getInitials, statusColors, tagColors } from '@/lib/utils';
import {
  ArrowRight,
  Users,
  GripVertical,
  Building,
  Mail,
} from 'lucide-react';

const PIPELINE_STAGES = [
  {
    key: 'Lead',
    label: 'Lead',
    color: 'border-t-blue-500',
    bgIcon: 'bg-blue-50 text-blue-600',
    description: 'New prospects',
  },
  {
    key: 'Contacted',
    label: 'Contacted',
    color: 'border-t-amber-500',
    bgIcon: 'bg-amber-50 text-amber-600',
    description: 'Initial outreach made',
  },
  {
    key: 'Qualified',
    label: 'Qualified',
    color: 'border-t-purple-500',
    bgIcon: 'bg-purple-50 text-purple-600',
    description: 'Vetted and qualified',
  },
  {
    key: 'Converted',
    label: 'Converted',
    color: 'border-t-emerald-500',
    bgIcon: 'bg-emerald-50 text-emerald-600',
    description: 'Closed deals',
  },
  {
    key: 'Lost',
    label: 'Lost',
    color: 'border-t-rose-500',
    bgIcon: 'bg-rose-50 text-rose-600',
    description: 'Did not convert',
  },
];

/**
 * PipelinePage Component
 * 
 * Renders a Kanban-style drag-and-drop board for managing customer sales pipelines.
 * Features 5 distinct visual stages and optimistic UI updates for instantaneous feedback.
 */
export default function PipelinePage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDragStart = (e, customerId) => {
    setDragging(customerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(stageKey);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOver(null);

    if (!dragging) return;

    const customer = customers.find((c) => c._id === dragging);
    if (!customer || customer.status === newStatus) {
      setDragging(null);
      return;
    }

    // Optimistic UI update for immediate feedback
    setCustomers((prev) =>
      prev.map((c) =>
        c._id === dragging ? { ...c, status: newStatus } : c
      )
    );
    setDragging(null);

    // Persist changes to backend
    try {
      await api.put(`/customers/${dragging}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert optimistic update on failure by refetching actual state
      fetchCustomers(); 
    }
  };

  const getStageCustomers = (stageKey) =>
    customers.filter((c) => c.status === stageKey);

  return (
    <>
      <Header
        title="Sales Pipeline"
        subtitle="Drag and drop to update customer stages"
      />

      <div className="p-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.key} className="pipeline-column animate-pulse">
                <div className="h-5 w-20 bg-gray-200 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-28 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {PIPELINE_STAGES.map((stage, stageIdx) => {
              const stageCustomers = getStageCustomers(stage.key);
              const isOver = dragOver === stage.key;

              return (
                <div
                  key={stage.key}
                  className={cn(
                    'pipeline-column border-t-[3px] transition-all duration-200 animate-fade-in',
                    stage.color,
                    isOver && 'bg-primary-50/50 border-primary-200 ring-2 ring-primary-200/50'
                  )}
                  style={{ animationDelay: `${stageIdx * 0.05}s` }}
                  onDragOver={(e) => handleDragOver(e, stage.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.key)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {stage.label}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {stage.description}
                      </p>
                    </div>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200/60 text-xs font-bold text-gray-700">
                      {stageCustomers.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2.5 min-h-[200px]">
                    {stageCustomers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 rounded-lg">
                        <Users className="h-5 w-5 text-gray-300 mb-2" />
                        <p className="text-xs text-gray-400">No customers</p>
                      </div>
                    ) : (
                      stageCustomers.map((customer, idx) => (
                        <div
                          key={customer._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, customer._id)}
                          onDragEnd={() => setDragging(null)}
                          className={cn(
                            'pipeline-card animate-fade-in group',
                            dragging === customer._id && 'opacity-40 scale-95'
                          )}
                          style={{ animationDelay: `${idx * 0.03}s` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold">
                                  {getInitials(customer.name)}
                                </div>
                                <Link
                                  to={`/customers/${customer._id}`}
                                  className="text-sm font-semibold text-gray-900 truncate hover:text-primary-600 transition-colors"
                                >
                                  {customer.name}
                                </Link>
                              </div>

                              {customer.company && (
                                <p className="flex items-center gap-1 text-xs text-gray-500 mb-1.5 ml-9">
                                  <Building className="h-3 w-3" />
                                  {customer.company}
                                </p>
                              )}

                              {customer.email && (
                                <p className="flex items-center gap-1 text-xs text-gray-400 mb-2 ml-9 truncate">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </p>
                              )}

                              {customer.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 ml-9">
                                  {customer.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      className={cn(
                                        'text-[9px] px-1.5 py-0',
                                        tagColors[tag] || ''
                                      )}
                                      variant="secondary"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
