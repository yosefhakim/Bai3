
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getMarketAnalysis(products: any[]) {
  const inventorySummary = products.map(p => `${p.name} (الفئة: ${p.category}, السعر: ${p.price} ج.م)`).join(', ');
  
  const systemInstruction = `
    أنت خبير اقتصادي ومحلل سوق محترف في السوق المصري.
    مهمتك هي تحليل مخزون التاجر وتقديم تقرير استراتيجي يشمل:
    1. تحليل لأسعار المنتجات مقارنة بمتوسط السوق.
    2. نصائح حول المنتجات التي يجب زيادة المخزون منها أو التخلص منها.
    3. توقعات لطلب السوق بناءً على الفصول والمواسم الحالية في مصر.
    4. استراتيجية تسعير مقترحة لزيادة التنافسية.
    
    يجب أن يكون الرد بتنسيق JSON يحتوي على مصفوفة من الأفكار (insights) وقسم للتقرير العام (generalReport).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `حلل هذا المخزون: ${inventorySummary}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  marketTrend: { type: Type.STRING, description: "اتجاه السوق الحالي لهذا المنتج" },
                  suggestedPriceRange: { type: Type.STRING },
                  advice: { type: Type.STRING, description: "نصيحة تجارية" }
                }
              }
            },
            generalReport: { type: Type.STRING, description: "تقرير شامل عن وضع المحل في السوق" }
          },
          required: ["insights", "generalReport"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
}

/**
 * Processes natural language commands from the user to perform business actions.
 * Supports adding products, expenses, and creating sales.
 */
export async function processNaturalLanguageCommand(command: string, context: { products: any[], customers: any[] }) {
  const productsSummary = context.products.map(p => `${p.name} (السعر: ${p.price})`).join(', ');
  
  const systemInstruction = `
    أنت مساعد ذكي لتاجر مصري. مهمتك هي فهم الأوامر بالعامية المصرية أو الفصحى وتحويلها لعمليات محاسبية.
    العمليات المدعومة:
    - ADD_PRODUCT: إضافة منتج جديد (الاسم، السعر، المخزون)
    - ADD_EXPENSE: تسجيل مصروف (الوصف، المبلغ، الفئة)
    - CREATE_SALE: إنشاء فاتورة بيع (اسم المنتج، الكمية)
    
    المنتجات الحالية: [${productsSummary}]
    
    يجب أن يكون الرد بتنسيق JSON حصراً.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: command,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "رد نصي للتاجر عما سيتم تنفيذه" },
            type: { type: Type.STRING, description: "نوع العملية: ADD_PRODUCT, ADD_EXPENSE, CREATE_SALE, UNKNOWN" },
            payload: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                cost: { type: Type.NUMBER },
                stock: { type: Type.NUMBER },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      productName: { type: Type.STRING },
                      quantity: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          },
          required: ["message", "type"]
        }
      }
    });

    return JSON.parse(response.text || '{"message": "عذراً، لم أفهم الطلب", "type": "UNKNOWN"}');
  } catch (error) {
    console.error("NLP Error:", error);
    return { message: "حدث خطأ في معالجة طلبك", type: "UNKNOWN" };
  }
}

/**
 * Identifies a product from an image and suggests whether to sell it or add it to inventory.
 */
export async function identifyProductFromImage(base64Image: string, products: any[]) {
  const productsSummary = products.map(p => p.name).join(', ');
  
  const systemInstruction = `
    أنت خبير في التعرف على المنتجات التجارية. انظر للصورة وحدد ماهية المنتج.
    قارن المنتج مع قائمة منتجات المحل الحالية: [${productsSummary}]
    إذا كان المنتج موجوداً، اقترح إنشاء عملية بيع (CREATE_SALE).
    إذا كان جديداً، اقترح إضافته للمخزون (ADD_PRODUCT).
    يجب أن يكون الرد بتنسيق JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "تعرف على هذا المنتج واقترح العملية المناسبة" }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            type: { type: Type.STRING },
            payload: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      productName: { type: Type.STRING },
                      quantity: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          },
          required: ["message", "type"]
        }
      }
    });

    return JSON.parse(response.text || '{"message": "لم أستطع التعرف على المنتج", "type": "UNKNOWN"}');
  } catch (error) {
    console.error("Vision Error:", error);
    return { message: "حدث خطأ أثناء تحليل الصورة", type: "UNKNOWN" };
  }
}
