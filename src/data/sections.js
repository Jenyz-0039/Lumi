export const sections = [
  { id: 'opening', index: '01', label: '开屏', title: '欢迎来到可颂', description: '开屏占位：后续接入云朵、色块扩散和露米的正式 IP 素材。', type: 'opening' },
  { id: 'background', index: '02', label: '背景介绍', title: 'Lumi露米——让热爱不止一种形状', description: '从日常里微小的惊喜出发，认识一朵不为热爱设限的云。', type: 'background' },
  { id: 'transition-one', index: '03', label: '转场 1', title: '一段面包制作转场', description: '视频占位：等待正式转场视频素材，不使用脚本中的临时参考视频。', type: 'video' },
  { id: 'expressions', index: '04', label: '表情', title: '露米的五种表情', description: '五个静态相框占位，点击后预留大图查看和关闭按钮。', type: 'expressions' },
  { id: 'transition-two', index: '05', label: '转场 2', title: '定格，然后继续出发', description: '定格动画占位：等待正式视频或关键帧素材。', type: 'video' },
  { id: 'actions', index: '06', label: '动作', title: '露米的动作记录', description: '动作图片占位：后续按照参考节奏做滚动蹦跳，并支持反向滚动倒放。', type: 'actions' },
  { id: 'outfits', index: '07', label: '服装', title: '今天穿哪一套？', description: '挑一套喜欢的衣服，看看露米穿上它的样子。', type: 'outfits' },
  { id: 'scenes', index: '08', label: '场景', title: '露米的生活场景', description: '五张场景照片随滚动依次展示。', type: 'scenes' },
  { id: 'game', index: '09', label: '小游戏', title: '和露米玩一会儿', description: '轻量互动占位：预留投喂、摸头、表情变化和音效触发接口。', type: 'game' },
  { id: 'ending', index: '10', label: '结束', title: '露米，下次见', description: '结束文案占位：后续补充 IP 名称和简短文案。', type: 'ending' },
];

export const expressions = Array.from({ length: 5 }, (_, index) => ({ id: `expression-${index + 1}`, label: `表情 ${index + 1}`, asset: null }));
// 当前动作数量仅作为占位数据，后续按正式参考素材数量调整。
export const actions = Array.from({ length: 4 }, (_, index) => ({ id: `action-${index + 1}`, label: `动作 ${index + 1}`, asset: null }));
const outfitAsset = (name) => `./public/assets/outfits/${name}.png`;
export const outfits = [
  { id: 'blue-pink-camp', label: '晴空漫游', asset: outfitAsset('blue-pink-camp'), character: outfitAsset('blue-pink-camp-lumi'), primary: '#C9D8F2', arrows: ['#C9D8F2', '#B8CDEA', '#DFDDF3'] },
  { id: 'denim-bow', label: '蝴蝶结日记', asset: outfitAsset('denim-bow'), character: outfitAsset('denim-bow-lumi'), primary: '#8EA9CB', arrows: ['#8EA9CB', '#A9BBD4', '#C0C7DD'] },
  { id: 'cream-bear', label: '小熊午后', asset: outfitAsset('cream-bear'), character: outfitAsset('cream-bear-lumi'), primary: '#E8D8BD', arrows: ['#E8D8BD', '#D8CCB8', '#F1E3C9'] },
  { id: 'blue-polka-cape', label: '星星雨披', asset: outfitAsset('blue-polka-cape'), character: outfitAsset('blue-polka-cape-lumi'), primary: '#A7CEE8', arrows: ['#A7CEE8', '#BBDCED', '#9CC9D9'] },
  { id: 'pink-bunny', label: '兔兔花园', asset: outfitAsset('pink-bunny'), character: outfitAsset('pink-bunny-lumi'), primary: '#E9B6C8', arrows: ['#E9B6C8', '#F0C7D3', '#DAB2D2'] },
  { id: 'yellow-overalls', label: '雏菊假日', asset: outfitAsset('yellow-overalls'), character: outfitAsset('yellow-overalls-lumi'), primary: '#E9D285', arrows: ['#E9D285', '#F0DEAA', '#D9D2A2'] },
];
export const scenes = Array.from({ length: 5 }, (_, index) => ({ id: `scene-${index + 1}`, label: `场景 ${index + 1}`, asset: null }));
