import { Bell, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  const { user } = useAuth();
  const u = user as any;

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="header-title">{title}</h1>
          {subtitle && <p className="text-muted-foreground" data-testid="header-subtitle">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-4">
          {children}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </button>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={u?.name || u?.email || 'User'} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground" data-testid="text-username">
                      {u?.name || `${u?.email || 'User'}`}
                    </span>
                  </div>
        </div>
      </div>
    </header>
  );
}
