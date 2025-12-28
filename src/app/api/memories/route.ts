import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractAndStoreMedia } from '@/lib/media-parser'

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

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const hasMood = searchParams.get('hasMood') === 'true'
    const includeMedia = searchParams.get('includeMedia') !== 'false' // default true

    // Build query with filters
    let query = supabase
      .from('memories')
      .select(
        includeMedia
          ? `
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
          `
          : `
            *,
            memory_tags (
              tags (
                id,
                name
              )
            )
          `
      )

    // Apply date filters
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    // Apply mood filter
    if (hasMood) {
      query = query.not('mood', 'is', null)
    }

    // Apply ordering and limit
    query = query.order('date', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }

    const { data: memories, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform tags structure - extract just the tag names
    const transformedMemories = (memories || []).map((memory: any) => ({
      ...memory,
      tags: memory.memory_tags?.map((mt: any) => mt.tags?.name).filter(Boolean) || [],
    }))

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

    // Parse HTML content and extract media URLs
    await extractAndStoreMedia(supabase, memory.id, content)

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Batch fetch existing tags to avoid N+1 queries
      const { data: existingTags } = await supabase
        .from('tags')
        .select('id, name')
        .eq('user_id', user.id)
        .in('name', tags)

      const existingTagMap = new Map(
        (existingTags || []).map(tag => [tag.name, tag.id])
      )

      // Determine which tags need to be created
      const tagsToCreate = tags.filter(tagName => !existingTagMap.has(tagName))

      // Batch insert new tags
      if (tagsToCreate.length > 0) {
        const { data: newTags } = await supabase
          .from('tags')
          .insert(tagsToCreate.map(name => ({ name, user_id: user.id })))
          .select('id, name')

        // Add new tags to the map
        if (newTags) {
          newTags.forEach(tag => existingTagMap.set(tag.name, tag.id))
        }
      }

      // Batch insert memory_tags associations
      const memoryTagsToInsert = tags
        .map(tagName => {
          const tagId = existingTagMap.get(tagName)
          return tagId ? { memory_id: memory.id, tag_id: tagId } : null
        })
        .filter((item): item is { memory_id: string; tag_id: string } => item !== null)

      if (memoryTagsToInsert.length > 0) {
        await supabase.from('memory_tags').insert(memoryTagsToInsert)
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
