import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all memories
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('memories')
    .select('*, media(*), memory_tags(tags(*))')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memories: data })
}

// POST create new memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, title, content, date, location, mood } = body

    if (!user_id || !title || !content || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('memories')
      .insert([
        {
          user_id,
          title,
          content,
          date,
          location,
          mood,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ memory: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
