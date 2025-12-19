import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export form as PDF in A4 format - fits on single page
 * @param {HTMLElement} element - The form element to export
 * @param {string} filename - Output filename
 */
export async function exportToPDF(element, filename = 'emek-spor-kayit-formu.pdf') {
  try {
    // Clone the element to avoid visual changes during export
    const clone = element.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    document.body.appendChild(clone);
    
    // Fix vertical text for PDF - rotate whole word 90 degrees to the left, centered
    const sectionHeaders = clone.querySelectorAll('.section-header');
    
    sectionHeaders.forEach((th) => {
      th.style.position = 'relative';
      th.style.verticalAlign = 'middle';
      
      const span = th.querySelector('span');
      if (span) {
        span.style.writingMode = 'initial';
        span.style.textOrientation = 'initial';
        span.style.transform = 'rotate(-90deg)';
        span.style.display = 'inline-block';
        span.style.whiteSpace = 'nowrap';
        span.style.position = 'absolute';
        span.style.top = '50%';
        span.style.left = '50%';
        span.style.transform = 'translate(-50%, -50%) rotate(-90deg)';
      }
    });
    
    // Fix table cell inputs - replace inputs with text for better rendering
    const allInputs = clone.querySelectorAll('input[type="text"], input:not([type])');
    allInputs.forEach((input) => {
      const value = input.value || '';
      const span = document.createElement('span');
      span.textContent = value;
      span.style.display = 'block';
      span.style.width = '100%';
      span.style.height = '100%';
      span.style.lineHeight = input.parentElement.offsetHeight + 'px';
      span.style.verticalAlign = 'middle';
      span.style.fontFamily = 'Inter, sans-serif';
      span.style.fontSize = window.getComputedStyle(input).fontSize;
      span.style.color = '#000000';
      input.parentNode.replaceChild(span, input);
    });
    
    // Create canvas from the cloned element
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Remove the clone
    document.body.removeChild(clone);

    // A4 dimensions in mm
    const a4Width = 210;
    const a4Height = 297;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit exactly on one A4 page
    const canvasAspectRatio = canvas.width / canvas.height;
    const a4AspectRatio = a4Width / a4Height;

    let imgWidth, imgHeight;

    if (canvasAspectRatio > a4AspectRatio) {
      // Canvas is wider - fit to width
      imgWidth = a4Width;
      imgHeight = a4Width / canvasAspectRatio;
    } else {
      // Canvas is taller - fit to height
      imgHeight = a4Height;
      imgWidth = a4Height * canvasAspectRatio;
    }

    // Center the image on the page
    const xOffset = (a4Width - imgWidth) / 2;
    const yOffset = (a4Height - imgHeight) / 2;

    // Add image to PDF - single page, scaled to fit
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

    // Save PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Export form as DOCX in A4 format - editable text version matching the design
 * @param {HTMLElement} element - The form element (for getting photo)
 * @param {Object} formData - The form data
 * @param {Object} settings - The form settings
 * @param {string} filename - Output filename
 */
export async function exportToDOCX(element, formData, settings, filename = 'emek-spor-kayit-formu.docx') {
  try {
    const { sporcu, baba, anne } = formData;

    // Get photo from the form if exists
    let photoData = null;
    const photoImg = element.querySelector('.photo-area img');
    if (photoImg && photoImg.src && !photoImg.src.includes('data:image/svg')) {
      try {
        // For base64 images
        if (photoImg.src.startsWith('data:image')) {
          const base64 = photoImg.src.split(',')[1];
          photoData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        } else {
          const response = await fetch(photoImg.src);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          photoData = new Uint8Array(arrayBuffer);
        }
      } catch (e) {
        // Photo fetch failed
      }
    }

    // Get logo
    let logoData = null;
    const logoImg = element.querySelector('.club-logo');
    if (logoImg && logoImg.src) {
      try {
        if (logoImg.src.startsWith('data:image')) {
          const base64 = logoImg.src.split(',')[1];
          logoData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        } else {
          const response = await fetch(logoImg.src);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          logoData = new Uint8Array(arrayBuffer);
        }
      } catch (e) {
        // Logo fetch failed
      }
    }

    // Create document sections
    const children = [];

    // Header Table - Logo | Club Info | Photo
    // Logo cell content
    const logoCellChildren = [];
    if (logoData) {
      logoCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: logoData,
              transformation: { width: 60, height: 60 },
            }),
          ],
        })
      );
    } else {
      logoCellChildren.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
    }

    // Photo cell content - tall rectangle
    const photoCellChildren = [];
    if (photoData) {
      photoCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: photoData,
              transformation: { width: 70, height: 90 },
            }),
          ],
        })
      );
    } else {
      // Empty photo area - just space
      photoCellChildren.push(
        new Paragraph({ spacing: { before: 200, after: 200 }, children: [] })
      );
    }

    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            // Logo + Club Info (left side)
            new TableCell({
              width: { size: 85, type: WidthType.PERCENTAGE },
              verticalAlign: 'center',
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE },
                  },
                  rows: [
                    new TableRow({
                      children: [
                        // Logo
                        new TableCell({
                          width: { size: 15, type: WidthType.PERCENTAGE },
                          verticalAlign: 'center',
                          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          children: logoCellChildren,
                        }),
                        // Club Info
                        new TableCell({
                          width: { size: 85, type: WidthType.PERCENTAGE },
                          verticalAlign: 'center',
                          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: settings.clubName || 'EMEK SPOR KULÜBÜ',
                                  bold: true,
                                  size: 36, // 18pt - ana başlık
                                  font: 'Calibri',
                                }),
                              ],
                            }),
                            new Paragraph({
                              spacing: { before: 30 },
                              children: [
                                new TextRun({
                                  text: '⊙  ' + (settings.address || 'Yücetepe, 88. Cd. No:7 Çankaya/ANKARA'),
                                  size: 18, // 9pt
                                  font: 'Calibri',
                                }),
                              ],
                            }),
                            new Paragraph({
                              spacing: { before: 15 },
                              children: [
                                new TextRun({
                                  text: '☎  ' + (settings.phone || '0 551 525 37 00'),
                                  size: 18, // 9pt
                                  font: 'Calibri',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            // Photo (right side - tall like in form) - no border, no background
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              verticalAlign: 'center',
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: photoCellChildren,
            }),
          ],
        }),
      ],
    });

    children.push(headerTable);

    // Form Title
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: '000000' },
        spacing: { before: 50, after: 50 },
        children: [
          new TextRun({
            text: settings.formTitle || 'KAYIT VE SÖZLEŞME FORMU',
            bold: true,
            size: 24, // 12pt - başlık
            color: 'FFFFFF',
            font: 'Calibri',
          }),
        ],
      })
    );

    // Main content table - SPORCU on left, BABA/ANNE on right
    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            // Left side - SPORCU table
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                createSporcuTable(sporcu),
              ],
            }),
            // Right side - BABA and ANNE tables
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                createParentTable('BABA', baba),
                createParentTable('ANNE', anne),
              ],
            }),
          ],
        }),
      ],
    });

    children.push(mainTable);

    // EMEK SPOR KULÜBÜ PRENSİPLERİ
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: '000000' },
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: 'EMEK SPOR KULÜBÜ PRENSİPLERİ',
            bold: true,
            size: 24, // 12pt - başlık
            color: 'FFFFFF',
            font: 'Calibri',
          }),
        ],
      })
    );

    const principles = [
      'Sporcu ve velilerimiz tesise girdiğinde Sağlık Bakanlığı ve İçişleri Bakanlığının pandemi nedeniyle alınmasını zorunlu tuttuğu yada tutacağı tüm uygulamalara uyulması zorunludur. Bakanlıklarca bu ve buna benzer uygulamalardaki değişiklikler aynen uygulanacaktır.',
      'EMEK SK Spor Okulu sporcuları Fair-Play (Centilmenlik) ve Respect (Saygı) kurallarına uymak zorundadır.',
      'Belirlenen tarihlerde yapılacak olan bilimsel testlere tüm sporcular katılmak zorundadır.',
      'Saat, para, cep telefonu vb. gibi kıymetli eşyalar, antrenman ya da müsabaka öncesi spor okulu görevlisine teslim edilir ve antrenmandan sonra alınır. Tarafımıza teslim edilmeyen eşyalardan spor okulumuzun sorumluluğu bulunmamaktadır.',
      'Yukarıda belirtilen maddelere sporcu ve veliler uymak zorundadır. Aksi halde hiçbir hak talep edilemez.',
    ];

    principles.forEach((text, index) => {
      children.push(
        new Paragraph({
          spacing: { before: 20, after: 25 },
          children: [
            new TextRun({ text: `${index + 1}. ${text}`, size: 20, font: 'Calibri' }), // 10pt
          ],
        })
      );
    });

    // Empty line after principles
    children.push(new Paragraph({ children: [] }));

    // MALİ HUSUSLAR
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: '000000' },
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: 'EMEK SPOR KULÜBÜ MALİ HUSUSLAR',
            bold: true,
            size: 24, // 12pt - başlık
            color: 'FFFFFF',
            font: 'Calibri',
          }),
        ],
      })
    );

    const financial = [
      'EMEK SK Spor Okulu eğitim ücretleri 1, 2, 4, 6 ya da 12 aylık ödeme tercihine göre peşin olarak ödenir.',
      'Aylık ödeme tarihleri ilgili ayın 1-5 veya 15-20 si arasında yapılır.',
      'Kayıtta bir aylık ücret peşin olarak alınır. İndirimli sözleşmenin iptal edilmesi durumunda indirim oranları tahsil edilir.',
      'EMEK SK Spor Okullarının belirlediği tek tip spor malzeme giyilmektedir. Malzeme ücreti aylık aidatın içinde değildir.',
      'Sporcunun kayıt sonrası devamsızlığında geri ödeme yapılmamaktadır. (2,4,6 ve 12 aylık peşin ödemeler hariç)',
      'Müsabaka Performans Takımına (bu sözleşmede bundan sonra MPT diye anılacaktır) seçilip ilgili federasyon lisansı çıkarılan sporcuların, spor okulu antrenmanlarının dışında da katıldığı antrenman ve müsabaka giderlerine ait eğitim ücreti ayrıca tahsil edilmektedir. Performans Takımı ücreti 12 aylık periyot olarak hesaplanır. Tatil hastalık vs durumunda ücret kesintisi olmaz.',
    ];

    financial.forEach((text, index) => {
      children.push(
        new Paragraph({
          spacing: { before: 20, after: 25 },
          children: [
            new TextRun({ text: `${index + 1}. ${text}`, size: 20, font: 'Calibri' }), // 10pt
          ],
        })
      );
    });

    // Empty line after financial
    children.push(new Paragraph({ children: [] }));

    // MUVAFAKATNAME VE TAAHHÜTNAME
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: '000000' },
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: 'YASAL VELİNİN SAĞLIK, LİSANS, SEYEHAT VB. KONULARA AİT MUVAFAKATNAME VE TAAHHÜTNAME',
            bold: true,
            size: 24, // 12pt - başlık
            color: 'FFFFFF',
            font: 'Calibri',
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        spacing: { after: 20 },
        children: [
          new TextRun({ text: 'Yukarıdaki sporcu ve yasal veli kimlik bilgileri doğru olup;', size: 20, font: 'Calibri' }),
        ],
      })
    );

    const consent = [
      'Spor okulu ödemelerimi her ayın tarihleri arasında yapacağımı,',
      'Sporcu performansını geliştirip, EMEK SK Spor Okulu MPT programına alınmasına karar verildiği taktirde, MPT adına lisansının çıkarılmasına, antrenman ve müsabakalarına katılmasına izin verdiğimi,',
      'Sporcuya EMEK SK Spor Okulu, MPT ve ilgili federasyonların antrenman, müsabaka ve katılmaya hak kazanılması durumunda il içi ve il dışı şampiyonaları için kafile ile birlikte seyahat etmesine izin vereceğimi,',
      'EMEK SK Spor Okulu ve MPT\'nin müsabaka, antrenman vb. esnasında çekilen resim, video ve röportaj görüntülerinin EMEK SK Spor Okulu ve MPT resmi yayın organları tarafından yayınlanmasında sakınca olmadığını,',
      'Spor Okulu ve MPT çalışmalarına hiç bir şekilde müdahalede bulunmayacağımı,',
      'Spor Okulu ve MPT tarafından tarafımıza iletilecek olan SMS ve e-mail bilgilendirme mesajlarının gelmesine izin verdiğimi,',
      'COVID-19 gibi ortaya çıkan yada çıkacak olan pandemi süreçleri boyunca Sağlık Bakanlığı ve İçişleri Bakanlığının konuya ait yönetmelik, genelge vb. tüm hijyen tedbirleri ile EMEK SK Spor Okulu ve MPT hijyen talimatlarına antrenman yada müsabaka öncesi, esnası ve sonrasında uyacağımızı, hastalık belirtileri gibi durumlarda önceden mutlaka bilgi vereceğimi,',
      'Velisi / Vasisi bulunduğum sporcunun; Türkiye Halk Sağlığı Kurumu Başkanlığının 11.07.2013 tarih ve 9985883-045-71261 sayılı "SPORCU SAĞLIK KURULU RAPORLARI" konulu yazısına istinaden, tam teşekküllü sağlık kontrolü tarafımın sorumluluğunda olmak şartı ile spor faaliyetlerine katılmasında sağlık yönünden sakınca olmadığını, kabul, beyan ve taahhüt ederim.',
    ];

    consent.forEach((text, index) => {
      children.push(
        new Paragraph({
          spacing: { before: 15, after: 20 },
          children: [
            new TextRun({ text: `${index + 1}. ${text}`, size: 20, font: 'Calibri' }), // 10pt
          ],
        })
      );
    });

    // Empty line after consent
    children.push(new Paragraph({ children: [] }));

    // Date and Signatures
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 30 },
        children: [
          new TextRun({ text: '..../..../202...', size: 20, font: 'Calibri' }),
        ],
      })
    );

    // Signatures table
    const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Emek Spor Kulübü Yetkilisi', bold: true, size: 24, font: 'Calibri' })] }),
                new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: 'Adı Soyadı :', size: 20, font: 'Calibri' })] }),
                new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: 'İmzası        :', size: 20, font: 'Calibri' })] }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Yasal Velisi/Vasisi', bold: true, size: 24, font: 'Calibri' })] }),
                new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: 'Adı Soyadı :', size: 20, font: 'Calibri' })] }),
                new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: 'İmzası        :', size: 20, font: 'Calibri' })] }),
              ],
            }),
          ],
        }),
      ],
    });

    children.push(signatureTable);

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 400, right: 500, bottom: 400, left: 500 },
            },
          },
          children: children,
        },
      ],
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
    return true;
  } catch (error) {
    throw error;
  }
}

// Helper function to create SPORCU table with horizontal header
function createSporcuTable(sporcu) {
  const rows = [
    ['BRANŞI', sporcu.bransi || ''],
    ['TC KİMLİK NO', sporcu.tcKimlikNo || ''],
    ['ADI SOYADI', sporcu.adiSoyadi || ''],
    ['D. TARİHİ', sporcu.dogumTarihi || ''],
    ['OKULU', sporcu.okulu || ''],
    ['SINIF NO', sporcu.sinifNo || ''],
    ['SPORCU CEP', sporcu.sporcuCep || ''],
    ['EV ADRESİ', sporcu.evAdresi || ''],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row - SPORCUNUN
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            shading: { fill: '000000' },
            margins: { top: 15, bottom: 15, left: 30, right: 30 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'SPORCUNUN', bold: true, color: 'FFFFFF', size: 22, font: 'Calibri' })],
              }),
            ],
          }),
        ],
      }),
      // Data rows
      ...rows.map(row => new TableRow({
        children: [
          createLabelCell(row[0]),
          createValueCell(row[1]),
        ],
      })),
    ],
  });
}

// Helper function to create parent (BABA/ANNE) table with horizontal header
function createParentTable(label, data) {
  const rows = [
    ['TC KİMLİK NO', data.tcKimlikNo || ''],
    ['ADI SOYADI', data.adiSoyadi || ''],
    ['MESLEĞİ', data.meslegi || ''],
    ['CEP TEL', data.cepTel || ''],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row - BABA or ANNE
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            shading: { fill: '000000' },
            margins: { top: 12, bottom: 12, left: 30, right: 30 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: label, bold: true, color: 'FFFFFF', size: 22, font: 'Calibri' })],
              }),
            ],
          }),
        ],
      }),
      // Data rows
      ...rows.map(row => new TableRow({
        children: [
          createParentLabelCell(row[0]),
          createValueCell(row[1]),
        ],
      })),
    ],
  });
}

// Helper function to create parent table label cell
function createParentLabelCell(text) {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    shading: { fill: '000000' },
    verticalAlign: 'center',
    margins: { top: 10, bottom: 10, left: 20, right: 20 },
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({ text: text, bold: true, color: 'FFFFFF', size: 18, font: 'Calibri' }),
        ],
      }),
    ],
  });
}

// Helper function to create label cell (black background, white text)
function createLabelCell(text) {
  return new TableCell({
    width: { size: 22, type: WidthType.PERCENTAGE },
    shading: { fill: '000000' },
    verticalAlign: 'center',
    margins: { top: 15, bottom: 15, left: 30, right: 30 },
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({ text: text, bold: true, color: 'FFFFFF', size: 20, font: 'Calibri' }), // 10pt
        ],
      }),
    ],
  });
}

// Helper function to create value cell (white background, black text)
function createValueCell(text) {
  return new TableCell({
    width: { size: 70, type: WidthType.PERCENTAGE },
    verticalAlign: 'center',
    margins: { top: 15, bottom: 15, left: 30, right: 30 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({ text: text, size: 20, font: 'Calibri' }), // 10pt
        ],
      }),
    ],
  });
}
