import { supabaseAdmin } from './supabase';

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

export async function deleteUser(userId: number) {
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

export async function getExperienceById(id: number) {
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

export async function updateExperience(id: number, updates: any) {
  const { error } = await supabaseAdmin
    .from('experiences')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[Database] Error updating experience:', error);
    throw error;
  }
}

export async function deleteExperience(id: number) {
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
      user:users(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error getting reservations:', error);
    return [];
  }

  return data?.map(r => ({
    reservation: r,
    experience: r.experience,
    user: r.user
  })) || [];
}

export async function getReservationsByCompany(company: string) {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select(`
      *,
      experience:experiences!inner(*),
      user:users(*)
    `)
    .eq('experience.company', company)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Error getting reservations by company:', error);
    return [];
  }

  return data?.map(r => ({
    reservation: r,
    experience: r.experience,
    user: r.user
  })) || [];
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

export async function cancelReservation(id: number, reason: string, cancelledBy: number) {
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

  return {
    totalReservations: totalReservations || 0,
    monthlyGMV,
    cancelledCount: cancelledCount || 0,
    cancellationRate
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
