import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET all memories for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Create Supabase client with the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Fetch memories (RLS automatically filters by user_id)
    const { data: memories, error } = await supabase
      .from('memories')
      .select(`
        *,
        media (
          id,
          url,
          type,
          thumbnail_url
        ),
        memory_tags (
          tags (
            id,
            name
          )
        )
      `)
      .order('date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform tags structure - extract just the tag names
    const transformedMemories = memories?.map(memory => ({
      ...memory,
      tags: memory.memory_tags?.map((mt: any) => mt.tags?.name).filter(Boolean) || [],
    })) || []

    return NextResponse.json({ memories: transformedMemories })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new memory
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Create Supabase client with the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, date, location, mood, tags } = body

    if (!title || !content || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, date' },
        { status: 400 }
      )
    }

    // Insert memory (RLS ensures user_id is correct)
    const { data: memory, error } = await supabase
      .from('memories')
      .insert({
        user_id: user.id,
        title,
        content,
        date,
        location: location || null,
        mood: mood || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        // Check if tag exists for this user
        let { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .eq('user_id', user.id)
          .single()

        let tagId

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({ name: tagName, user_id: user.id })
            .select('id')
            .single()

          if (!tagError && newTag) {
            tagId = newTag.id
          }
        }

        // Link tag to memory
        if (tagId) {
          await supabase
            .from('memory_tags')
            .insert({
              memory_id: memory.id,
              tag_id: tagId,
            })
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      memory 
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Invalid request body' },
      { status: 400 }
    )
  }
}
