import {NextRequest,NextResponse} from 'next/server';import {db,sql} from '@/lib/db';import {adminFrom} from '@/lib/auth';import {errorResponse} from '@/lib/http';
export async function GET(req:NextRequest){if(!adminFrom(req))return NextResponse.json({error:'Admin access required.'},{status:403});try{const p=await db();const r=await p.request().query('SELECT * FROM dbo.Events ORDER BY StartsAt DESC');return NextResponse.json({events:r.recordset})}catch(e){return errorResponse(e)}}
export async function POST(req:NextRequest){if(!adminFrom(req))return NextResponse.json({error:'Admin access required.'},{status:403});try{const x=await req.json();if(!x.title||!x.category||!x.city||!x.startsAt||!x.description||Number(x.price)<0)return NextResponse.json({error:'Complete all required fields and enter a valid price.'},{status:400});const p=await db();const r=await p.request().input('title',sql.NVarChar,x.title).input('category',sql.NVarChar,x.category).input('city',sql.NVarChar,x.city).input('date',sql.DateTime2,new Date(x.startsAt)).input('price',sql.Decimal(12,2),Number(x.price)||0).input('description',sql.NVarChar,x.description).input('image',sql.NVarChar,x.imageUrl||'').input('active',sql.Bit,x.isActive===false?0:1).query('INSERT dbo.Events(Title,Category,City,StartsAt,Price,Description,ImageUrl,IsActive) OUTPUT INSERTED.* VALUES(@title,@category,@city,@date,@price,@description,@image,@active)');return NextResponse.json({event:r.recordset[0]},{status:201})}catch(e){return errorResponse(e)}}
export async function PATCH(req: NextRequest) {
	if (!adminFrom(req))
		return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
	try {
		const data = await req.json();
		const pool = await db();
		const request = pool.request().input('id', sql.Int, Number(data.id));

		if (typeof data.isActive === 'boolean' && !('title' in data)) {
			const result = await request
				.input('active', sql.Bit, data.isActive)
				.query('UPDATE dbo.Events SET IsActive=@active,UpdatedAt=SYSUTCDATETIME() OUTPUT INSERTED.Id,INSERTED.IsActive WHERE Id=@id');
			if (!result.recordset.length)
				return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
			return NextResponse.json({ event: result.recordset[0] });
		}

		const startsAt = new Date(data.startsAt);
		const price = Number(data.price);
		if (
			!Number.isInteger(Number(data.id)) ||
			!data.title?.trim() ||
			!data.category?.trim() ||
			!data.city?.trim() ||
			!data.description?.trim() ||
			Number.isNaN(startsAt.getTime()) ||
			!Number.isFinite(price) ||
			price < 0
		) {
			return NextResponse.json(
				{ error: 'Complete all required fields and enter a valid price.' },
				{ status: 400 }
			);
		}

		const result = await request
			.input('title', sql.NVarChar(160), data.title.trim())
			.input('category', sql.NVarChar(40), data.category.trim())
			.input('city', sql.NVarChar(100), data.city.trim())
			.input('date', sql.DateTime2, startsAt)
			.input('price', sql.Decimal(12, 2), price)
			.input('description', sql.NVarChar(1000), data.description.trim())
			.input('image', sql.NVarChar(1000), data.imageUrl?.trim() || null)
			.input('active', sql.Bit, data.isActive === false ? 0 : 1)
			.query('UPDATE dbo.Events SET Title=@title,Category=@category,City=@city,StartsAt=@date,Price=@price,Description=@description,ImageUrl=@image,IsActive=@active,UpdatedAt=SYSUTCDATETIME() OUTPUT INSERTED.* WHERE Id=@id');

		if (!result.recordset.length)
			return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
		return NextResponse.json({ event: result.recordset[0] });
	} catch (error) {
		return errorResponse(error);
	}
}
