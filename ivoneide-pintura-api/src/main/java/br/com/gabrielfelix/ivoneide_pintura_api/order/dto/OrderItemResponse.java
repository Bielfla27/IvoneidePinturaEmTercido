package br.com.gabrielfelix.ivoneide_pintura_api.order.dto;

import java.math.BigDecimal;

import br.com.gabrielfelix.ivoneide_pintura_api.order.OrderItem;

public class OrderItemResponse {

	private Long id;
	private Long produtoId;
	private String produtoNome;
	private Integer quantidade;
	private BigDecimal precoUnitario;
	private BigDecimal subtotal;

	public OrderItemResponse(OrderItem item) {
		this.id = item.getId();
		this.produtoId = item.getProduto().getId();
		this.produtoNome = item.getProduto().getNome();
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
