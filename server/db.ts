import { supabaseAdmin } from './supabase';

// =====================================================
// TYPES
// =====================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =====================================================
// USERS
// =====================================================

export async function getUserByAuthId(authId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Database] Error getting user:', error);
    return undefined;
  }

  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error getting users:', error);
    return [];
  }

  return data || [];
}

export async function getUsersPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
  const { page, pageSize, search, sortColumn = 'created_at', sortDirection = 'desc' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' });

  // Apply search filter
  if (search && search.trim()) {
    query = query.or(`email.ilike.%${search}%,phone_number.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[Database] Error getting users paginated:', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function searchUsers(query: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .or(`email.ilike.%${query}%,phone_number.ilike.%${query}%,full_name.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error searching users:', error);
    return [];
  }

  return data || [];
}

export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('[Database] Error deleting user:', error);
    throw error;
  }
}

// =====================================================
// ADMINS
// =====================================================

export async function getAdminByAuthId(authId: string) {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('auth_id', authId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Database] Error getting admin:', error);
    return undefined;
  }

  return data;
}

export async function createAdmin(admin: any) {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .insert(admin)
    .select()
    .single();

  if (error) {
    console.error('[Database] Error creating admin:', error);
    throw error;
  }

  return data;
}

export async function getAllAdmins() {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error getting admins:', error);
    return [];
  }

  return data || [];
}

// =====================================================
// HOTEL PARTNERS
// =====================================================

export async function getHotelPartnerByAuthId(authId: string) {
  const { data, error } = await supabaseAdmin
    .from('hotel_partners')
    .select('*')
    .eq('auth_id', authId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Database] Error getting hotel partner:', error);
    return undefined;
  }

  return data;
}

export async function createHotelPartner(partner: any) {
  const { data, error} = await supabaseAdmin
    .from('hotel_partners')
    .insert(partner)
    .select()
    .single();

  if (error) {
    console.error('[Database] Error creating hotel partner:', error);
    throw error;
  }

  return data;
}

export async function getAllHotelPartners() {
  const { data, error } = await supabaseAdmin
    .from('hotel_partners')
    .select('*')
    .order('created_at', { ascending: false});

  if (error) {
    console.error('[Database] Error getting hotel partners:', error);
    return [];
  }

  return data || [];
}

export async function getHotelPartnersPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
  const { page, pageSize, search, sortColumn = 'created_at', sortDirection = 'desc' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('hotel_partners')
    .select('*', { count: 'exact' });

  // Apply search filter
  if (search && search.trim()) {
    query = query.or(`hotel_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[Database] Error getting hotel partners paginated:', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function updateHotelPartner(id: number, updates: any) {
  const { error } = await supabaseAdmin
    .from('hotel_partners')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[Database] Error updating hotel partner:', error);
    throw error;
  }
}

export async function deleteHotelPartner(id: string) {
  const { error } = await supabaseAdmin
    .from('hotel_partners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Database] Error deleting hotel partner:', error);
    throw error;
  }
}

// =====================================================
// EXPERIENCES
// =====================================================

export async function getAllExperiences() {
  const { data, error } = await supabaseAdmin
    .from('experiences')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error getting experiences:', error);
    return [];
  }

  return data || [];
}

export async function getExperiencesPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
  const { page, pageSize, search, sortColumn = 'created_at', sortDirection = 'desc' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('experiences')
    .select('*', { count: 'exact' });

  // Apply search filter
  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%,company.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[Database] Error getting experiences paginated:', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getExperiencesByCompany(company: string) {
  const { data, error } = await supabaseAdmin
    .from('experiences')
    .select('*')
    .eq('company', company)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error getting experiences by company:', error);
    return [];
  }

  return data || [];
}

export async function getExperiencesByCompanyPaginated(
  company: string,
  params: PaginationParams
): Promise<PaginatedResult<any>> {
  const { page, pageSize, search, sortColumn = 'created_at', sortDirection = 'desc' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('experiences')
    .select('*', { count: 'exact' })
    .eq('company', company);

  // Apply search filter
  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[Database] Error getting experiences by company paginated:', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getExperienceById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('experiences')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Database] Error getting experience:', error);
    return undefined;
  }

  return data;
}

export async function createExperience(experience: any) {
  const { data, error } = await supabaseAdmin
    .from('experiences')
    .insert(experience)
    .select()
    .single();

  if (error) {
    console.error('[Database] Error creating experience:', error);
    throw error;
  }

  return data;
}

export async function updateExperience(id: string, updates: any) {
  const { error } = await supabaseAdmin
    .from('experiences')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[Database] Error updating experience:', error);
    throw error;
  }
}

export async function deleteExperience(id: string) {
  const { error } = await supabaseAdmin
    .from('experiences')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Database] Error deleting experience:', error);
    throw error;
  }
}

export async function bulkDeactivateExpiredExperiences() {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('experiences')
    .update({ is_active: false })
    .lte('date_end', now)
    .eq('is_active', true);

  if (error) {
    console.error('[Database] Error deactivating expired experiences:', error);
    throw error;
  }
}

// =====================================================
// RESERVATIONS
// =====================================================

export async function getAllReservations() {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select(`
      *,
      experience:experiences(*),
      user:users(*),
      roomTypeDetails:room_types(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error getting reservations:', error);
    return [];
  }

  return data || [];
}

export async function getReservationsPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
  const { page, pageSize, search, sortColumn = 'created_at', sortDirection = 'desc' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('reservations')
    .select(`
      *,
      experience:experiences(*),
      user:users(*),
      roomTypeDetails:room_types(*)
    `, { count: 'exact' });

  // Apply search filter
  if (search && search.trim()) {
    query = query.or(`booking_reference.ilike.%${search}%,room_type.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[Database] Error getting reservations paginated:', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getReservationsByCompany(company: string) {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select(`
      *,
      experience:experiences!inner(*),
      user:users(*),
      roomTypeDetails:room_types(*)
    `)
    .eq('experience.company', company)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error getting reservations by company:', error);
    return [];
  }

  return data || [];
}

export async function getReservationsByCompanyPaginated(
  company: string,
  params: PaginationParams
): Promise<PaginatedResult<any>> {
  const { page, pageSize, search, sortColumn = 'created_at', sortDirection = 'desc' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('reservations')
    .select(`
      *,
      experience:experiences!inner(*),
      user:users(*),
      roomTypeDetails:room_types(*)
    `, { count: 'exact' })
    .eq('experience.company', company);

  // Apply search filter
  if (search && search.trim()) {
    query = query.or(`booking_reference.ilike.%${search}%,room_type.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[Database] Error getting reservations by company paginated:', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getReservationById(id: number) {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select(`
      *,
      experience:experiences(*),
      user:users(*)
    `)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Database] Error getting reservation:', error);
    return undefined;
  }

  return data ? {
    reservation: data,
    experience: data.experience,
    user: data.user
  } : undefined;
}

export async function searchReservations(bookingRef: string) {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select(`
      *,
      experience:experiences(*),
      user:users(*)
    `)
    .ilike('booking_reference', `%${bookingRef}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error searching reservations:', error);
    return [];
  }

  return data?.map(r => ({
    reservation: r,
    experience: r.experience,
    user: r.user
  })) || [];
}

export async function createReservation(reservation: any) {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .insert(reservation)
    .select()
    .single();

  if (error) {
    console.error('[Database] Error creating reservation:', error);
    throw error;
  }

  return data;
}

export async function updateReservation(id: number, updates: any) {
  const { error } = await supabaseAdmin
    .from('reservations')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[Database] Error updating reservation:', error);
    throw error;
  }
}

export async function cancelReservation(id: number, reason: string, cancelledBy: string) {
  const { error } = await supabaseAdmin
    .from('reservations')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_by: cancelledBy,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('[Database] Error cancelling reservation:', error);
    throw error;
  }
}

export async function deleteReservation(id: string) {
  const { error } = await supabaseAdmin
    .from('reservations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Database] Error deleting reservation:', error);
    throw error;
  }
}

// =====================================================
// ANALYTICS
// =====================================================

export async function getReservationStats() {
  // Total réservations
  const { count: totalReservations } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true });

  // GMV mensuel
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyData } = await supabaseAdmin
    .from('reservations')
    .select('total_price')
    .gte('created_at', startOfMonth.toISOString());

  const monthlyGMV = monthlyData?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;

  // Taux d'annulation
  const { count: cancelledCount } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled');

  const cancellationRate = totalReservations && totalReservations > 0
    ? ((cancelledCount || 0) / totalReservations * 100).toFixed(2)
    : "0.00";

  // Total revenue
  const { data: allReservations } = await supabaseAdmin
    .from('reservations')
    .select('total_price')
    .neq('status', 'cancelled');

  const totalRevenue = allReservations?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;

  // Pending payments count
  const { count: pendingPaymentsCount } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', 'pending')
    .neq('status', 'cancelled');

  // Confirmed reservations count
  const { count: confirmedCount } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed');

  // Upcoming check-ins (next 7 days)
  const now = new Date();
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);

  const { count: upcomingCheckInsCount } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .gte('check_in_date', now.toISOString())
    .lte('check_in_date', next7Days.toISOString())
    .neq('status', 'cancelled');

  return {
    totalReservations: totalReservations || 0,
    monthlyGMV,
    cancelledCount: cancelledCount || 0,
    cancellationRate,
    totalRevenue,
    pendingPaymentsCount: pendingPaymentsCount || 0,
    confirmedCount: confirmedCount || 0,
    upcomingCheckInsCount: upcomingCheckInsCount || 0,
  };
}

export async function getPartnerReservationStats(company: string) {
  // Get experience IDs for this company
  const { data: experiences } = await supabaseAdmin
    .from('experiences')
    .select('id')
    .eq('company', company);

  const experienceIds = experiences?.map(e => e.id) || [];

  if (experienceIds.length === 0) {
    return {
      totalReservations: 0,
      totalRevenue: 0,
      pendingPaymentsCount: 0,
      confirmedCount: 0,
      upcomingCheckInsCount: 0,
    };
  }

  // Total reservations for partner
  const { count: totalReservations } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .in('experience_id', experienceIds);

  // Total revenue
  const { data: allReservations } = await supabaseAdmin
    .from('reservations')
    .select('total_price')
    .in('experience_id', experienceIds)
    .neq('status', 'cancelled');

  const totalRevenue = allReservations?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;

  // Pending payments count
  const { count: pendingPaymentsCount } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .in('experience_id', experienceIds)
    .eq('payment_status', 'pending')
    .neq('status', 'cancelled');

  // Confirmed reservations count
  const { count: confirmedCount } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .in('experience_id', experienceIds)
    .eq('status', 'confirmed');

  // Upcoming check-ins (next 7 days)
  const now = new Date();
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);

  const { count: upcomingCheckInsCount } = await supabaseAdmin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .in('experience_id', experienceIds)
    .gte('check_in_date', now.toISOString())
    .lte('check_in_date', next7Days.toISOString())
    .neq('status', 'cancelled');

  return {
    totalReservations: totalReservations || 0,
    totalRevenue,
    pendingPaymentsCount: pendingPaymentsCount || 0,
    confirmedCount: confirmedCount || 0,
    upcomingCheckInsCount: upcomingCheckInsCount || 0,
  };
}

export async function getTopExperiences(limit: number = 10) {
  const { data, error } = await supabaseAdmin
    .from('experiences')
    .select(`
      *,
      reservations(count)
    `)
    .limit(limit);

  if (error) {
    console.error('[Database] Error getting top experiences:', error);
    return [];
  }

  // Calculer les revenus pour chaque expérience
  const experiencesWithStats = await Promise.all(
    (data || []).map(async (exp) => {
      const { data: reservations } = await supabaseAdmin
        .from('reservations')
        .select('total_price')
        .eq('experience_id', exp.id);

      const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;
      const bookingCount = reservations?.length || 0;

      return {
        experience: exp,
        bookingCount,
        totalRevenue
      };
    })
  );

  return experiencesWithStats.sort((a, b) => b.bookingCount - a.bookingCount);
}

export async function getHotelRevenue(company: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Revenus mois en cours
  const { data: currentMonth } = await supabaseAdmin
    .from('reservations')
    .select('total_price, experiences!inner(company)')
    .eq('experiences.company', company)
    .gte('created_at', startOfMonth.toISOString());

  const currentMonthRevenue = currentMonth?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;
  const currentMonthBookings = currentMonth?.length || 0;

  // Revenus mois précédent
  const { data: previousMonth } = await supabaseAdmin
    .from('reservations')
    .select('total_price, experiences!inner(company)')
    .eq('experiences.company', company)
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString());

  const previousMonthRevenue = previousMonth?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;
  const previousMonthBookings = previousMonth?.length || 0;

  return {
    currentMonthRevenue,
    currentMonthBookings,
    previousMonthRevenue,
    previousMonthBookings
  };
}

// =====================================================
// ROOM TYPES
// =====================================================

export async function getRoomTypesByExperience(experienceId: string) {
  const { data, error } = await supabaseAdmin
    .from('room_types')
    .select('*')
    .eq('experience_id', experienceId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Database] Error getting room types:', error);
    return [];
  }

  return data || [];
}

export async function getRoomTypeById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('room_types')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Database] Error getting room type:', error);
    return undefined;
  }

  return data;
}

export async function createRoomType(roomType: {
  experience_id: string;
  name: string;
  description?: string;
  base_capacity?: number;
  max_capacity?: number;
  size?: number;
  bed_type?: string;
  amenities?: any;
  images?: string[];
}) {
  const { data, error } = await supabaseAdmin
    .from('room_types')
    .insert(roomType)
    .select()
    .single();

  if (error) {
    console.error('[Database] Error creating room type:', error);
    throw new Error('Failed to create room type');
  }

  return data;
}

export async function updateRoomType(id: string, updates: Partial<{
  name: string;
  description: string;
  base_capacity: number;
  max_capacity: number;
  size: number;
  bed_type: string;
  amenities: any;
  images: string[];
}>) {
  const { data, error } = await supabaseAdmin
    .from('room_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Database] Error updating room type:', error);
    throw new Error('Failed to update room type');
  }

  return data;
}

export async function deleteRoomType(id: string) {
  // First, get the room type to retrieve its images
  const { data: roomType, error: fetchError } = await supabaseAdmin
    .from('room_types')
    .select('images')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('[Database] Error fetching room type:', fetchError);
    throw new Error('Failed to fetch room type');
  }

  // Delete images from storage if they exist
  if (roomType?.images && roomType.images.length > 0) {
    try {
      // Extract paths from image URLs
      const imagePaths = roomType.images.map((url: string) => {
        // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
        const urlParts = url.split('/storage/v1/object/public/');
        if (urlParts.length === 2) {
          const [bucket, ...pathParts] = urlParts[1].split('/');
          return pathParts.join('/');
        }
        return null;
      }).filter((path: string | null): path is string => path !== null);

      if (imagePaths.length > 0) {
        const { error: storageError } = await supabaseAdmin.storage
          .from('hotels')
          .remove(imagePaths);

        if (storageError) {
          console.error('[Database] Error deleting room type images:', storageError);
          // Continue with room type deletion even if image deletion fails
        }
      }
    } catch (error) {
      console.error('[Database] Exception while deleting room type images:', error);
      // Continue with room type deletion even if image deletion fails
    }
  }

  // Delete the room type record
  const { error } = await supabaseAdmin
    .from('room_types')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Database] Error deleting room type:', error);
    throw new Error('Failed to delete room type');
  }

  return true;
}

// =====================================================
// AVAILABILITY PERIODS
// =====================================================

export async function getAvailabilityByDateRange(
  experienceId: string,
  startDate: string,
  endDate: string,
  roomTypeId?: string
) {
  let query = supabaseAdmin
    .from('availability_periods')
    .select('*, room_types(*)')
    .eq('experience_id', experienceId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (roomTypeId) {
    query = query.eq('room_type_id', roomTypeId);
  }

  query = query.order('date', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('[Database] Error getting availability:', error);
    return [];
  }

  return data || [];
}

export async function getAvailabilityForDate(
  experienceId: string,
  date: string,
  roomTypeId?: string
) {
  let query = supabaseAdmin
    .from('availability_periods')
    .select('*, room_types(*)')
    .eq('experience_id', experienceId)
    .eq('date', date);

  if (roomTypeId) {
    query = query.eq('room_type_id', roomTypeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Database] Error getting availability for date:', error);
    return [];
  }

  return data || [];
}

export async function upsertAvailabilityPeriods(periods: Array<{
  id?: string;
  experience_id: string;
  room_type_id: string;
  date: string;
  price: number;
  original_price: number;
  available_rooms: number;
  is_available: boolean;
}>) {
  const { data, error } = await supabaseAdmin
    .from('availability_periods')
    .upsert(periods, {
      onConflict: 'experience_id,room_type_id,date'
    })
    .select();

  if (error) {
    console.error('[Database] Error upserting availability periods:', error);
    throw new Error('Failed to upsert availability periods');
  }

  return data || [];
}

export async function deleteAvailabilityPeriod(id: string) {
  const { error } = await supabaseAdmin
    .from('availability_periods')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Database] Error deleting availability period:', error);
    throw new Error('Failed to delete availability period');
  }

  return true;
}

export async function getAvailabilityPeriodById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('availability_periods')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Database] Error getting availability period:', error);
    return undefined;
  }

  return data;
}

export async function getAvailabilitySummary(
  experienceId: string,
  month: number,
  year: number
) {
  // Get first and last day of month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('availability_periods')
    .select('date, room_type_id, is_available, available_rooms, price')
    .eq('experience_id', experienceId)
    .gte('date', startDateStr)
    .lte('date', endDateStr)
    .order('date', { ascending: true });

  if (error) {
    console.error('[Database] Error getting availability summary:', error);
    return [];
  }

  return data || [];
}

// =====================================================
// NIGHT OPTIONS & RESERVATION PRICING
// =====================================================

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Validate if the selected number of nights is allowed for an experience
 */
export async function validateNightSelection(
  experienceId: string,
  nights: number
): Promise<{ valid: boolean; allowedNights: number[] }> {
  const { data, error } = await supabaseAdmin
    .from('experiences')
    .select('allowed_nights')
    .eq('id', experienceId)
    .single();

  if (error) {
    console.error('[Database] Error fetching experience allowed_nights:', error);
    throw error;
  }

  const allowedNights = data?.allowed_nights || [1, 2, 3];
  const valid = allowedNights.includes(nights);

  return { valid, allowedNights };
}

/**
 * Calculate reservation price with detailed breakdown
 */
export async function calculateReservationPrice(params: {
  experienceId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  extras?: Array<{ label: string; price: number; quantity: number }>;
}): Promise<{
  totalPrice: number;
  priceBreakdown: {
    nights: number;
    roomType: string;
    nightlyRates: Array<{ date: string; price: number }>;
    subtotal: number;
    extras?: Array<{ label: string; price: number; quantity: number }>;
    extrasTotal?: number;
    total: number;
  };
}> {
  const { experienceId, roomTypeId, checkInDate, checkOutDate, extras } = params;

  // Calculate number of nights
  const nights = calculateNights(checkInDate, checkOutDate);

  // Get room type details
  const { data: roomType, error: roomTypeError } = await supabaseAdmin
    .from('room_types')
    .select('name')
    .eq('id', roomTypeId)
    .single();

  if (roomTypeError) {
    console.error('[Database] Error fetching room type:', roomTypeError);
    throw roomTypeError;
  }

  // Get availability periods for the date range (excluding checkout date)
  const availabilityPeriods = await getAvailabilityByDateRange(
    experienceId,
    checkInDate,
    checkOutDate,
    roomTypeId
  );

  // Build nightly rates array
  const nightlyRates: Array<{ date: string; price: number }> = [];
  let subtotal = 0;

  // Generate array of dates from check-in to check-out (excluding checkout)
  const checkIn = new Date(checkInDate);
  const dates: string[] = [];
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkIn);
    currentDate.setDate(checkIn.getDate() + i);
    dates.push(currentDate.toISOString().split('T')[0]);
  }

  // Match dates with availability periods
  for (const date of dates) {
    const period = availabilityPeriods.find((p: any) => p.date === date);
    if (!period) {
      throw new Error(`No availability period found for date: ${date}`);
    }
    if (!period.is_available) {
      throw new Error(`Selected date is not available: ${date}`);
    }
    nightlyRates.push({
      date,
      price: Number(period.price),
    });
    subtotal += Number(period.price);
  }

  // Calculate extras total
  let extrasTotal = 0;
  if (extras && extras.length > 0) {
    extrasTotal = extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0);
  }

  // Calculate total
  const totalPrice = subtotal + extrasTotal;

  // Build price breakdown
  const priceBreakdown = {
    nights,
    roomType: roomType.name,
    nightlyRates,
    subtotal,
    ...(extras && extras.length > 0 && { extras, extrasTotal }),
    total: totalPrice,
  };

  return { totalPrice, priceBreakdown };
}
