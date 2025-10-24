import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient',
    age: '',
    gender: '',
    phone: '',
    specialization: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(formData);
      toast({ title: 'Account created', description: 'You are now signed up.' });
      setLocation('/patient');
    } catch (err) {
      const msg = (err && err.details && err.details.message) ? err.details.message : (err && err.message) ? err.message : 'Could not create account';
      toast({ title: 'Signup failed', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Heart className="text-primary-foreground w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'patient' && (
                <>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input id="gender" type="text" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} />
                  </div>
                </>
              )}

              {formData.role === 'doctor' && (
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" type="text" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} />
                </div>
              )}

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="text" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Create account'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
