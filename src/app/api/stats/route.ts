import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    // Get total memories count
    const { count: totalMemories } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get mood distribution
    const { data: moodData } = await supabase
      .from('memories')
      .select('mood')
      .eq('user_id', userId)

    const moodCounts = moodData?.reduce((acc: any, item) => {
      acc[item.mood] = (acc[item.mood] || 0) + 1
      return acc
    }, {})

    // Get recent memories (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentMemories } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())

    // Get total photos
    const { count: totalPhotos } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'image')

    return NextResponse.json({
      stats: {
        totalMemories: totalMemories || 0,
        recentMemories: recentMemories || 0,
        totalPhotos: totalPhotos || 0,
        moodDistribution: moodCounts || {},
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
