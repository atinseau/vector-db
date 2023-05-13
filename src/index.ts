import weaviate from "weaviate-ts-client"
import fetch from 'node-fetch'

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
})



const articleSchemaConfig = {
  class: 'Article',
  properties: [
    {
      dataType: ['text'],
      name: 'title'
    },
    {
      dataType: ['text'],
      name: 'body'
    }
  ]
}

// const schemas = await client.schema.getter().do()

// if (schemas.classes.length && schemas.classes.find((c) => c.class === articleSchemaConfig.class)) {
//   await client.schema.classDeleter().withClassName(articleSchemaConfig.class).do()
// }

// const articleSchema = await client.schema.classCreator().withClass(articleSchemaConfig).do()

// console.log(articleSchema)

interface Article {
  id: number
  title: string
  body: string
  userId: number
  tags: string[]
  reactions: number
}

async function vectorizeArticle() {
  const res = await fetch('https://dummyjson.com/posts?limit=32')
  const articlesResponse = (await res.json() as {
    posts: Article[],
    total: number,
    skip: number,
    limit: number,
  })

  const articles = articlesResponse.posts

  let batcher = client.batch.objectsBatcher();
  let batchCount = 0
  let batchSize = articlesResponse.total / 10
  let dataSetSize = 0

  for (const article of articles) {

    const articleObj = {
      class: 'Article',
      properties: {
        title: article.title,
        body: article.body
      }
    }

    batcher = batcher.withObject(articleObj)
    batchCount += 1

    if (batchCount === batchSize) {
      console.log('Batching...')
      await batcher.do()
      batcher = client.batch.objectsBatcher();
      dataSetSize += batchCount
      batchCount = 0
    }
  }

  if (batchCount > 0) { // for lefting batch at the end
    console.log('Batching...')
    await batcher.do()
    dataSetSize += batchCount
  }

  console.log(batchSize, batchCount, articlesResponse.total)

  console.log('Done! ' + dataSetSize + ' articles vectorized')

}


// await vectorizeArticle()

const result = await client.graphql
  .get()
  .withClassName(articleSchemaConfig.class)
  .withFields('title body')
  .withLimit(5)
  .withNearText({
    concepts: [
      'nature',
      'forest',
      'green'
    ]
  })
  .do()

console.log(result.data.Get)