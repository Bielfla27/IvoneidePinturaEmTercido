package br.com.gabrielfelix.ivoneide_pintura_api.order.dto;

import java.math.BigDecimal;

import br.com.gabrielfelix.ivoneide_pintura_api.order.OrderItem;

public class OrderItemResponse {

	private Long id;
	private Long produtoId;
	private String produtoNome;
	private String produtoDescricao;
	private String produtoUrlImagemCapa;
	private Integer produtoQuantidadePaginas;
	private Integer quantidade;
	private BigDecimal precoUnitario;
	private BigDecimal subtotal;

	public OrderItemResponse(OrderItem item) {
		this.id = item.getId();
		this.produtoId = item.getProduto().getId();
		this.produtoNome = item.getProduto().getNome();
		this.produtoDescricao = item.getProduto().getDescricao();
		this.produtoUrlImagemCapa = item.getProduto().getUrlImagemCapa();
		this.produtoQuantidadePaginas = item.getProduto().getQuantidadePaginas();
		this.quantidade = item.getQuantidade();
		this.precoUnitario = item.getPrecoUnitario();
		this.subtotal = item.getSubtotal();
	}

	public Long getId() {
		return id;
	}

	public Long getProdutoId() {
		return produtoId;
	}

	public String getProdutoNome() {
		return produtoNome;
	}

	public String getProdutoDescricao() {
		return produtoDescricao;
	}

	public String getProdutoUrlImagemCapa() {
		return produtoUrlImagemCapa;
	}

	public Integer getProdutoQuantidadePaginas() {
		return produtoQuantidadePaginas;
	}

	public Integer getQuantidade() {
		return quantidade;
	}

	public BigDecimal getPrecoUnitario() {
		return precoUnitario;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}
}
