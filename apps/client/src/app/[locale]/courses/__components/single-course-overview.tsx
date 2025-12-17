import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent } from '@/components/atoms/card';
import { Separator } from '@/components/atoms/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/atoms/dialog';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { ICourseOverview } from '@/lib/types/course/course.interface';
import { IUser } from '@/lib/types/user/user.interface';
import { CheckCircle, Play, Timer, AlertCircle, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useWallet } from '@/lib/hooks/wallet/use-wallet';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { toast } from 'react-toastify';

interface BillingFormData {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    street: string;
    apartment: string;
    building: string;
    city: string;
    country: string;
    country_code: string;
    floor: string;
    extra_description: string;
}

const SingleCourseOverView: React.FC<{ course: ICourseOverview, user?: IUser }> = ({ course, user }) => {

    const { data: wallet = { _id: "", balance: 0 } } = useWallet()

    useEffect(() => { console.log("wallet============>", { wallet }) }, [wallet])

    const [selectedPricing, setSelectedPricing] = useState<BillingCycle>(BillingCycle.ONE_TIME);
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState<'auth' | 'insufficient-balance' | 'billing-info' | 'confirm-enrollment'>('auth');

    // Auth form state
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Billing form state
    const [billingData, setBillingData] = useState<BillingFormData>({
        first_name: user?.firstName || '',
        last_name: user?.lastName || '',
        phone_number: user?.phone || '',
        email: user?.email || '',
        street: '',
        apartment: '',
        building: '',
        city: '',
        country: '',
        country_code: '+20',
        floor: '',
        extra_description: ''
    });

    // Update billing data when user changes
    useEffect(() => {
        if (user) {
            setBillingData(prev => ({
                ...prev,
                first_name: user.firstName || prev.first_name,
                last_name: user.lastName || prev.last_name,
                phone_number: user.phone || prev.phone_number,
                email: user.email || prev.email
            }));
        }
    }, [user]);

    const getPricingLabel = (type: BillingCycle) => {
        switch (type) {
            case "MONTHLY":
                return "Monthly";
            case "YEARLY":
                return "Yearly";
            case "ONE_TIME":
                return "One-time";
            default:
                return type;
        }
    };

    // Calculate time left for discount
    useEffect(() => {
        if (!course.isPaid) return;

        const updateTimeLeft = () => {
            const currentPricing = course.pricing[selectedPricing];
            if (!currentPricing || !currentPricing.discountEndDate) return;

            const now = new Date().getTime();
            const endTime = new Date(currentPricing.discountEndDate).getTime();
            const difference = endTime - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ days, hours, minutes });
            } else {
                setTimeLeft(null);
            }
        };

        updateTimeLeft();
        const timer = setInterval(updateTimeLeft, 60000);

        return () => clearInterval(timer);
    }, [selectedPricing, course.isPaid]);

    const getCurrentPrice = () => {
        if (!course.isPaid) return 0;
        return course.pricing[selectedPricing]?.originalPrice || 0;
    };

    const handleEnrollment = () => {
        // Step 1: Check if user is authenticated
        if (!user) {
            setDialogType('auth');
            setShowDialog(true);
            return;
        }

        // Step 2: Check wallet balance for paid courses
        if (course.isPaid) {
            const currentPrice = getCurrentPrice();
            const userBalance = wallet.balance

            if (userBalance < currentPrice) {
                setDialogType('insufficient-balance');
                setShowDialog(true);
                return;
            }

            // Step 3: Show billing info form for paid courses
            setDialogType('billing-info');
            setShowDialog(true);
        } else {
            // For free courses, go directly to confirmation
            setDialogType('confirm-enrollment');
            setShowDialog(true);
        }
    };

    const handleAuth = () => {
        // Implement your authentication logic here
        console.log('Auth attempt:', { email, password, name, mode: authMode });
        // After successful auth, close dialog and retry enrollment
        setShowDialog(false);
        // You might want to retry enrollment after successful auth
    };

    const handleBillingSubmit = () => {
        // Validate billing data
        const requiredFields = ['first_name', 'last_name', 'phone_number', 'email', 'street', 'city', 'country'];
        const missingFields = requiredFields.filter(field => !billingData[field as keyof BillingFormData]);

        if (missingFields.length > 0) {
            alert(`Please fill in required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Move to confirmation
        setDialogType('confirm-enrollment');
    };

    const handleConfirmEnrollment = async () => {
        try {
            const enrollmentPayload = {
                subscriptionType: "USER_COURSE",
                courseId: course._id,
                userId: user?._id,
                billingCycle: selectedPricing,
                frequency: selectedPricing == BillingCycle.MONTHLY ? 30 : selectedPricing == BillingCycle.YEARLY ? 365 : 0,
                customer: {
                    userId: user?._id,
                    first_name: billingData.first_name,
                    last_name: billingData.last_name,
                    phone_number: billingData.phone_number,
                    email: billingData.email
                },
                billing_data: {
                    first_name: billingData.first_name,
                    last_name: billingData.last_name,
                    phone_number: billingData.phone_number,
                    email: billingData.email,
                    street: billingData.street,
                    apartment: billingData.apartment,
                    building: billingData.building,
                    city: billingData.city,
                    country: billingData.country,
                    country_code: billingData.country_code,
                    floor: billingData.floor,
                    extra_description: billingData.extra_description
                }
            };

            const response = await createAuthorizedNatsRequest("enrollment.enrollToCourse", enrollmentPayload);

            console.log('Enrollment successful:', response);
            setShowDialog(false);
            // Show success message or redirect
            // alert('Successfully enrolled in course!');
            toast.success('Successfully enrolled in course!');
        } catch (error: any) {
            console.error('Enrollment failed:', error);
            if (error.message.includes('userId_1_courseId_1')) {
                toast.error("Already Enrolled To That Course .");
                return

            }
            toast.error('Enrollment failed:' + error.message as string);

            // alert('Enrollment failed. Please try again.');
        }
    };

    const getButtonText = () => {
        if (!course.isPaid) return "Enroll for Free";

        switch (selectedPricing) {
            case "MONTHLY":
                return "Start Monthly Subscription";
            case "YEARLY":
                return "Start Yearly Subscription";
            case "ONE_TIME":
                return "Enroll Now";
            default:
                return "Enroll Now";
        }
    };

    return (
        <>
            <Card className="sticky top-8">
                <CardContent className="p-0">
                    {/* Video Preview */}
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                        <Button size="lg" className="h-16 w-16 rounded-full">
                            <Play className="h-6 w-6 ml-1" />
                        </Button>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Wallet Balance Display for Authenticated Users */}
                        {user && course.isPaid && (
                            <Alert>
                                <Wallet className="h-4 w-4" />
                                <AlertDescription className="flex justify-between items-center">
                                    <span>Wallet Balance:</span>
                                    <span className="font-bold">${wallet.balance?.toFixed(2) || '0.00'}</span>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Pricing Section */}
                        {!course.isPaid ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-green-600">Free</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">No cost</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Get lifetime access at no cost!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Tabs value={selectedPricing} onValueChange={(value) => setSelectedPricing(value as BillingCycle)}>
                                    <TabsList className="grid w-full grid-cols-3">
                                        {Object.keys(course.pricing).map((type) => (
                                            <TabsTrigger key={type} value={type} className="text-xs">
                                                {getPricingLabel(type as BillingCycle)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {Object.entries(course.pricing).map(([type, pricing]) => (
                                        <TabsContent key={type} value={type} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-bold">
                                                    ${pricing.price}
                                                    {type === "MONTHLY" && <span className="text-lg font-normal">/month</span>}
                                                    {type === "YEARLY" && <span className="text-lg font-normal">/year</span>}
                                                </span>
                                                {pricing.originalPrice && (
                                                    <>
                                                        <span className="text-lg text-muted-foreground line-through">
                                                            ${pricing.originalPrice}
                                                        </span>
                                                        {pricing.discount && (
                                                            <Badge variant="destructive">
                                                                {pricing.discount.percentage}% off
                                                            </Badge>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {pricing.discount && timeLeft && type === selectedPricing && (
                                                <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                                                    <Timer className="h-4 w-4" />
                                                    <span>
                                                        {timeLeft.days > 0 && `${timeLeft.days}d `}
                                                        {timeLeft.hours}h {timeLeft.minutes}m left at this price!
                                                    </span>
                                                </div>
                                            )}

                                            {type === "YEARLY" && !!course?.pricing?.MONTHLY?.originalPrice && (
                                                <p className="text-sm text-green-600 font-medium">
                                                    Save ${((course.pricing.MONTHLY?.originalPrice * 12) - pricing.price).toFixed(2)} compared to monthly
                                                </p>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button size="lg" className="w-full" onClick={handleEnrollment}>
                                {getButtonText()}
                            </Button>
                            <Button variant="outline" size="lg" className="w-full">
                                Add to Wishlist
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            30-day money-back guarantee
                        </p>

                        <Separator />

                        <div className="space-y-3">
                            <h4 className="font-medium">This course includes:</h4>
                            <div className="space-y-2">
                                {course.learningObjectives.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Language:</span>
                                <span>{course?.language}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last updated:</span>
                                <span>{course.updatedAt}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Multi-purpose Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    {dialogType === 'auth' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</DialogTitle>
                                <DialogDescription>
                                    {authMode === 'signin'
                                        ? 'Sign in to enroll in this course'
                                        : 'Create an account to get started'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {authMode === 'signup' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <DialogFooter className="flex-col gap-2 sm:flex-col">
                                    <Button onClick={handleAuth} className="w-full">
                                        {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                                    >
                                        {authMode === 'signin'
                                            ? "Don't have an account? Sign up"
                                            : "Already have an account? Sign in"}
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}

                    {dialogType === 'insufficient-balance' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                    Insufficient Balance
                                </DialogTitle>
                                <DialogDescription>
                                    You don't have enough balance in your wallet to enroll in this course.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Alert>
                                    <Wallet className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="flex justify-between items-center">
                                            <span>Current Balance:</span>
                                            <span className="font-bold">${wallet.balance?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span>Course Price:</span>
                                            <span className="font-bold">${getCurrentPrice().toFixed(2)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between items-center text-destructive">
                                            <span>Need to add:</span>
                                            <span className="font-bold">${(getCurrentPrice() - (wallet.balance || 0)).toFixed(2)}</span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => {
                                    window.location.href = '/wallet/charge';
                                }}>
                                    Charge Wallet
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {dialogType === 'billing-info' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Billing Information</DialogTitle>
                                <DialogDescription>
                                    Please provide your billing details to complete enrollment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_first_name">First Name *</Label>
                                        <Input
                                            id="billing_first_name"
                                            value={billingData.first_name}
                                            onChange={(e) => setBillingData({ ...billingData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_last_name">Last Name *</Label>
                                        <Input
                                            id="billing_last_name"
                                            value={billingData.last_name}
                                            onChange={(e) => setBillingData({ ...billingData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_email">Email *</Label>
                                    <Input
                                        id="billing_email"
                                        type="email"
                                        value={billingData.email}
                                        onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_phone">Phone Number *</Label>
                                    <Input
                                        id="billing_phone"
                                        value={billingData.phone_number}
                                        onChange={(e) => setBillingData({ ...billingData, phone_number: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_street">Street Address *</Label>
                                    <Input
                                        id="billing_street"
                                        value={billingData.street}
                                        onChange={(e) => setBillingData({ ...billingData, street: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_apartment">Apartment</Label>
                                        <Input
                                            id="billing_apartment"
                                            value={billingData.apartment}
                                            onChange={(e) => setBillingData({ ...billingData, apartment: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_building">Building</Label>
                                        <Input
                                            id="billing_building"
                                            value={billingData.building}
                                            onChange={(e) => setBillingData({ ...billingData, building: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_floor">Floor</Label>
                                        <Input
                                            id="billing_floor"
                                            value={billingData.floor}
                                            onChange={(e) => setBillingData({ ...billingData, floor: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_city">City *</Label>
                                        <Input
                                            id="billing_city"
                                            value={billingData.city}
                                            onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_country">Country *</Label>
                                        <Input
                                            id="billing_country"
                                            value={billingData.country}
                                            onChange={(e) => setBillingData({ ...billingData, country: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_country_code">Country Code</Label>
                                    <Input
                                        id="billing_country_code"
                                        value={billingData.country_code}
                                        onChange={(e) => setBillingData({ ...billingData, country_code: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_extra">Additional Notes</Label>
                                    <Input
                                        id="billing_extra"
                                        value={billingData.extra_description}
                                        onChange={(e) => setBillingData({ ...billingData, extra_description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleBillingSubmit}>
                                    Continue to Review
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {dialogType === 'confirm-enrollment' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Confirm Enrollment</DialogTitle>
                                <DialogDescription>
                                    Review your enrollment details before confirming.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="rounded-lg border p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Course:</span>
                                        <span className="text-sm font-medium">{course.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Pricing Plan:</span>
                                        <span className="text-sm font-medium">{getPricingLabel(selectedPricing)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Price:</span>
                                        <span className="text-sm font-bold">${getCurrentPrice().toFixed(2)}</span>
                                    </div>
                                    {course.isPaid && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Current Balance:</span>
                                                <span className="text-sm">${wallet.balance?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Balance After:</span>
                                                <span className="text-sm font-medium">
                                                    ${((wallet.balance || 0) - getCurrentPrice()).toFixed(2)}
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-medium">Billing Information:</h5>
                                                <div className="text-xs space-y-1 text-muted-foreground">
                                                    <p>{billingData.first_name} {billingData.last_name}</p>
                                                    <p>{billingData.email}</p>
                                                    <p>{billingData.phone_number}</p>
                                                    <p>{billingData.street}, {billingData.apartment && `Apt ${billingData.apartment}`}</p>
                                                    <p>{billingData.city}, {billingData.country}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    if (course.isPaid) {
                                        setDialogType('billing-info');
                                    } else {
                                        setShowDialog(false);
                                    }
                                }}>
                                    {course.isPaid ? 'Edit Billing Info' : 'Cancel'}
                                </Button>
                                <Button onClick={handleConfirmEnrollment}>
                                    Confirm Enrollment
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SingleCourseOverView;