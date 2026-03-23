import React, { useState, useEffect } from 'react';
import { ViewState } from '../../App';
import { userService, Notification } from '../../services/userService';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface NotificationsPageProps {
  onNavigate: (view: ViewState) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await userService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await userService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic update
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // API calls in background
    try {
      await Promise.all(unreadIds.map(id => userService.markNotificationAsRead(id)));
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Revert if needed, but keeping simple for now
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await userService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up border border-slate-100 p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
              <Bell className="text-brand-600" /> Notifications
              {unreadCount > 0 && (
                <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full font-bold align-middle">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-1">Stay updated with your courses, assignments, and system alerts.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              <Check size={16} className="mr-2" /> Mark all read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Unread
          </button>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`group relative bg-white rounded-xl p-5 border shadow-sm transition-all hover:shadow-md hover:border-brand-200 flex gap-4 ${notification.read ? 'border-slate-200' : 'border-brand-100 bg-brand-50/10'
                  }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${notification.type === 'success' ? 'bg-green-100 text-green-600 group-hover:bg-green-200' :
                  notification.type === 'warning' ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-200' :
                    notification.type === 'error' ? 'bg-red-100 text-red-600 group-hover:bg-red-200' :
                      'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                  }`}>
                  <Bell size={20} />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm md:text-base text-slate-900 truncate pr-4 ${!notification.read ? 'text-brand-700' : ''}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed max-w-3xl">{notification.message}</p>

                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors"
                      >
                        <Check size={14} /> Mark as Read
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification._id, e)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {!notification.read && (
                  <div className="absolute top-5 right-5 w-2 h-2 bg-brand-500 rounded-full"></div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
                <Bell size={32} className="text-slate-300" />
                <span className="absolute top-0 right-0 p-2 bg-white rounded-full">
                  <div className="w-3 h-3 bg-brand-500 rounded-full animate-ping"></div>
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications yet</h3>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
                {filter === 'unread' ? "You've read all your important messages." : "When you get new assignments, course updates, or messages, they will appear here."}
              </p>
              {filter !== 'all' && (
                <Button variant="outline" onClick={() => setFilter('all')}>
                  View all notifications
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
